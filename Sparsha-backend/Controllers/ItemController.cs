using System.Security.Claims;
using System.Text.Json;
using FirebaseAdmin.Messaging;
using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sparsha_backend.Data;
using Sparsha_backend.Models;
using Sparsha_backend.Services;
using Notification = Sparsha_backend.Models.Notification;

namespace Sparsha_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly ItemDbContext _itemDbContext;
        private readonly MailService _mailService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly RazorPayService _razorPayService;
        public ItemController(
            ItemDbContext itemDbContext, 
            MailService mailService, 
            INotificationService notificationService, 
            IHubContext<NotificationHub> hubContext,
            RazorPayService razorPayService
            )
        {
            _itemDbContext = itemDbContext;
            _mailService = mailService;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _razorPayService = razorPayService;
        }

        
        public class DeviceTokenDto
        {
            public string UserId { get; set; }
            public string DeviceToken { get; set; }
        }

        [HttpPost("SendLoginNotification")]
        public async Task SendLoginNotification(string userId, string message)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", message);
        }

        [HttpGet("GetCategory")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _itemDbContext.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Category_Name,
                }).ToListAsync();
            return Ok(categories);
        }

        [HttpGet("GetAllItems")]
        public async Task<IActionResult> GetGlobalItems()
        {
            var items = await _itemDbContext.GlobalItems.Select(i => new
            {
                i.ItemId,
                i.Name,
                i.ImagePath,
                i.CurrentBid,
                i.Price,
                i.Description,
                i.IsFixedPrice,
                BiddingEndTime = _itemDbContext.ItemOfSellers
                .Where(s => s.ItemId == i.ItemId)
                .Select(s => s.BiddingEndTime)
                .FirstOrDefault()
            }).ToListAsync();
            return Ok(items);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadItem([FromForm] UploadItem item)
        {
            if (item.Image == null || item.Image.Length == 0)
                return BadRequest("Image is required");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(item.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await item.Image.CopyToAsync(stream);
            }

            var dbPath = "/uploads/" + fileName;

            var publicItem = new Items
            {
                Name = item.Name,
                Category = item.CategoryName,
                Description = item.Description,
                Price = item.MyPrice,
                CurrentBid = item.IsFixedPrice ? null : item.MyPrice,
                ImagePath = dbPath,
                IsFixedPrice = item.IsFixedPrice
            };

            _itemDbContext.GlobalItems.Add(publicItem);
            await _itemDbContext.SaveChangesAsync();

            var newItem = new ItemOfSellers
            {
                SellerId = item.SellerId,
                Name = item.Name,
                CategoryName = item.CategoryName,
                Description = item.Description,
                MyPrice = item.MyPrice,
                ImagePath = dbPath,
                ItemId = publicItem.ItemId,
                IsFixedPrice = item.IsFixedPrice,
                IsBiddingLocked = false,
                IsSold = false,
                BiddingEndTime = item.BiddingDays.HasValue
                ? DateTime.UtcNow.AddDays(item.BiddingDays.Value)
                : DateTime.UtcNow.AddDays(15),
                BuyerId = null,
                FinalPrice = null
            };

            _itemDbContext.ItemOfSellers.Add(newItem);
            await _itemDbContext.SaveChangesAsync();

            return Ok(new { message = "Item uploaded successfully", imagePath = dbPath });
        }

        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetItemsBySellerId(string sellerId)
        {
            var items = await _itemDbContext.ItemOfSellers
            .Where(x => x.SellerId == sellerId)
            .ToListAsync();

            return Ok(items);
        }

        [HttpGet("GlobalItems/ByCategory/{category}")]
        public async Task<IActionResult> GetItemsByCategory(string category)
        {
            var items = await _itemDbContext.GlobalItems
                .Where(x => x.Category == category)
                .Select(x => new
                {
                    x.ItemId,
                    x.Name,
                    x.Description,
                    x.ImagePath,
                    x.IsFixedPrice,
                    x.CurrentBid,
                    x.Price,
                    // Join with ItemOfSellers to get BiddingEndTime
                    BiddingEndTime = _itemDbContext.ItemOfSellers
                                .Where(s => s.ItemId == x.ItemId)
                                .Select(s => s.BiddingEndTime)
                                .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("GlobalItems/ById/{itemId}")]
        public async Task<IActionResult> GetItemByItemId(string itemId)
        {
            if (!Guid.TryParse(itemId, out Guid parsedItemId))
            {
                return BadRequest("Invalid item ID format.");
            }

            var item = await _itemDbContext.GlobalItems
                .Where(x => x.ItemId == parsedItemId)
                .Select(x => new
                {
                    x.ItemId,
                    x.Name,
                    x.Category,
                    x.Description,
                    x.Price,
                    x.CurrentBid,
                    x.IsFixedPrice,
                    x.ImagePath,
                    SellerId = _itemDbContext.ItemOfSellers
                        .Where(s => s.ItemId == x.ItemId)
                        .Select(s => s.SellerId)
                        .FirstOrDefault(),
                    BiddingEndTime = _itemDbContext.ItemOfSellers
                        .Where(s => s.ItemId == x.ItemId)
                        .Select(s => s.BiddingEndTime)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound("Item not found.");

            return Ok(item);
        }

        [HttpPost("wishlist/add")]
        public async Task<IActionResult> AddToWishList([FromBody] AddToWishlistDto dto)
        {
            try
            {
                var item = await _itemDbContext.ItemOfSellers
                    .Include(x => x.Item)
                    .FirstOrDefaultAsync(x => x.ItemId == dto.ItemId);
                if(item == null)
                {
                    return NotFound("Item not found.");
                }
                if(item.SellerId == dto.UserId)
                {
                    return BadRequest("You can't add your own item to wishlist");
                }
                var exists = await _itemDbContext.WishlistItems
                    .AnyAsync(w => w.UserId == dto.UserId && w.ItemId == dto.ItemId);

                if (exists)
                    return BadRequest("Item already in wishlist.");

                var wishlistItem = new WishlistItems
                {
                    UserId = dto.UserId,
                    ItemId = dto.ItemId
                };

                _itemDbContext.WishlistItems.Add(wishlistItem);
                await _itemDbContext.SaveChangesAsync();

                return Ok("Item added to wishlist");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error adding to wishlist: " + ex.Message);
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }

        [HttpGet("wishlist/{userId}")]
        public async Task<IActionResult> GetWishlist (string userId)
        {
            var items = await _itemDbContext.WishlistItems
                .Where(w => w.UserId == userId).Include(w => w.Item).ToListAsync();
            return Ok(items);
        }

        [HttpDelete("wishlist/remove")]
        public async Task<IActionResult> RemoveItemFromWishlist([FromBody] WishlistDeleteDto dto)
        {
            var wishlistItem = await _itemDbContext.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == dto.UserId && w.ItemId == dto.ItemId);

            if (wishlistItem == null)
            {
                return NotFound("Item not found in wishlist.");
            }

            _itemDbContext.WishlistItems.Remove(wishlistItem);
            await _itemDbContext.SaveChangesAsync();

            return Ok("Item removed from wishlist.");
        }


        [HttpPost("addItemToCart/{userId}")]
        public async Task<IActionResult> AddItemToCart (string userId, [FromBody] AddToCartDto dto)
        {
            if(dto.Quantity <= 0)
            {
                return BadRequest("Quantity must be at least 1");
            }
            var item = await _itemDbContext.ItemOfSellers
                .Include(x => x.Item)
                .FirstOrDefaultAsync(x => x.ItemId == dto.ItemId);
            if(item == null)
            {
                return NotFound("Item not found");
            }
            if(item.SellerId == userId)
            {
                return BadRequest("You can't add your own item to cart");
            }
            var cart = await _itemDbContext.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if(cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    Items = new List<CartItems>()
                };
                _itemDbContext.Carts.Add(cart);
                await _itemDbContext.SaveChangesAsync();
            }
            var existingItem = cart.Items.FirstOrDefault(i => i.ItemId == dto.ItemId);
            if(existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                _itemDbContext.CartItems.Update(existingItem);
            }
            else
            {
                var newCartItem = new CartItems
                {
                    CartId = cart.CartId,
                    ItemId = dto.ItemId,
                    Quantity = dto.Quantity,
                };
                _itemDbContext.CartItems.Add(newCartItem);
            }
            await _itemDbContext.SaveChangesAsync();
            var cartItemsDto = cart.Items.Select(i => new AddToCartDto
            {
                CartItemId = i.CartItemId,
                ItemId = i.ItemId,
                Quantity = i.Quantity
            }).ToList();

            return Ok(cartItemsDto);

        }


        [HttpGet("getCartItems/{userId}")]
        public async Task<IActionResult> GetCartItems (string userId)
        {
            var cart = await _itemDbContext.Carts.Include(c => c.Items)
                .ThenInclude(i => i.Item)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if(cart == null)
            {
                return NotFound("Cart not fount");
            }
            var cartItemsDto = cart.Items.Select(i => new 
            {
                CartItemId = i.CartItemId,
                ItemId = i.ItemId,
                Quantity = i.Quantity,
                Name = i.Item.Name,
                Price = i.Item.Price,
                ImagePath = i.Item.ImagePath,

            }).ToList();

            return Ok(cartItemsDto);
        }

        [HttpDelete("removeCartItem")]
        public async Task<IActionResult> RemoveItemFromCart([FromBody] CartItemDeleteDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserId))
                return BadRequest("UserId is required.");
            var cartItem = await _itemDbContext.CartItems
                .FirstOrDefaultAsync(c => c.ItemId == dto.ItemId && c.Cart.UserId == dto.UserId);
            if(cartItem == null)
            {
                return NotFound("Items not found in cart");
            }
            _itemDbContext.CartItems.Remove(cartItem);
            await _itemDbContext.SaveChangesAsync();
            return Ok("Items removed from wishlist");
        }

        [HttpPost("Send-code")]
        public async Task<IActionResult> SendCode([FromBody] CodeRequest request)
        {
            var buyer = await _itemDbContext.Members.FirstOrDefaultAsync(s => s.UserId == request.UserId);
            if(buyer == null || string.IsNullOrEmpty(buyer.Email))
            {
                return BadRequest("Seller not found or email is missing");
            }
            var code = _mailService.GenerateVerificationCode();

            bool result = await _mailService.SendCode(buyer.Email, buyer.Name, code);
            if (!result)
            {
                return StatusCode(500, "Failed to send verification email.");
            }
            return Ok(new { message = "Verification code sent to email" });
        }

        [HttpPost("verify-code")]
        public IActionResult verifyCode([FromBody] CodeVerify request)
        {
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest("Email is required");
            if (_mailService.VerifyCode(request.Email, request.Code))
                return Ok(new { message = "Verification successful!" });

            return BadRequest(new { message = "Invalid or expired code." });
        }
        [HttpGet("track-order/{userId}")]
        public async Task<IActionResult> GetYourOrders(string userId)
        {
            var orders = await _itemDbContext.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                return NotFound("No orders found for the user.");
            }

            var result = orders.Select(order => new
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                PaymentMethod = order.PaymentMethod,
                TotalPrice = order.TotalPrice,
                Items = order.OrderItems.Select(i => new
                {
                    OrderItemId = i.OrderItemId,
                    ItemId = i.ItemId,
                    Quantity = i.Quantity,
                    Name = i.Item.Name,
                    Price = i.Item.Price,
                    ImagePath = i.Item.ImagePath
                }).ToList()
            });

            return Ok(result);
        }

        [HttpPost("RaiseBid")]
        public async Task<IActionResult> RaiseBid([FromBody] RaiseDto dto)
        {
            try
            {
                var globalItem = await _itemDbContext.GlobalItems.FindAsync(dto.ItemId);
                if (globalItem == null)
                    return NotFound("Item not found");

                if (globalItem.IsFixedPrice)
                    return BadRequest("Bidding is not allowed on fixed-price items.");

                if (dto.NewBid <= 0)
                    return BadRequest("Bid must be greater than 0");

                var sellerItem = await _itemDbContext.ItemOfSellers
                    .FirstOrDefaultAsync(x => x.ItemId == dto.ItemId);
                if (sellerItem == null)
                    return NotFound("Seller item not found");

                if (sellerItem.SellerId == dto.UserId)
                    return BadRequest("You can't bid on your own item");

                if (dto.NewBid <= sellerItem.MyPrice)
                    return BadRequest($"Your bid must be greater than the seller's base price of ₹{sellerItem.MyPrice}.");

                if (dto.NewBid <= sellerItem.CurrentBid)
                    return BadRequest($"Your bid must be higher than the current bid of ₹{sellerItem.CurrentBid}.");

                if (sellerItem.BiddingEndTime.HasValue && DateTime.UtcNow > sellerItem.BiddingEndTime.Value)
                {
                    sellerItem.IsBiddingLocked = true;

                    var topBid = await _itemDbContext.Bids
                        .Where(b => b.ItemId == dto.ItemId)
                        .OrderByDescending(b => b.Amount)
                        .FirstOrDefaultAsync();

                    if (topBid != null)
                    {
                        sellerItem.IsSold = true;
                        sellerItem.BuyerId = topBid.UserId;
                        sellerItem.FinalPrice = topBid.Amount;
                        globalItem.CurrentBid = topBid.Amount;
                    }

                    await _itemDbContext.SaveChangesAsync();
                    return BadRequest("Bidding time has ended. The item has been locked.");
                }

                if (sellerItem.IsBiddingLocked)
                {
                    return BadRequest("Bidding on this item has been locked by the owner.");
                }

                var newBid = new Bid
                {
                    ItemId = dto.ItemId,
                    UserId = dto.UserId,
                    Amount = dto.NewBid,
                    BidTime = DateTime.UtcNow
                };
                _itemDbContext.Bids.Add(newBid);

                globalItem.CurrentBid = dto.NewBid;
                sellerItem.CurrentBid = dto.NewBid;

                var bidder = await _itemDbContext.Members
                    .FirstOrDefaultAsync(u => u.UserId == dto.UserId);
                string bidderName = bidder?.Name ?? "Someone";

                await _notificationService.SendAsync(new SendNotificationDto
                {
                    OwnerId = sellerItem.SellerId,
                    Title = "New Bid Alert! 🎯",
                    Body = $"New bid of ₹{dto.NewBid} from {bidderName} on your item '{globalItem.Name}'.",
                    Type = "bid",
                    Data = new Dictionary<string, string>
            {
                { "itemId", dto.ItemId.ToString() },
                { "newBid", dto.NewBid.ToString() },
                { "biddername", bidderName }
            }
                });

                await _hubContext.Clients.User(sellerItem.SellerId)
                    .SendAsync("ReceiveNotification", $"💰 New bid of ₹{dto.NewBid} from {bidderName} on '{globalItem.Name}'");

                var outbidUsers = await _itemDbContext.Bids
                    .Where(b => b.ItemId == dto.ItemId && b.UserId != dto.UserId)
                    .Select(b => b.UserId)
                    .Distinct()
                    .ToListAsync();

                foreach (var userId in outbidUsers)
                {
                    await _notificationService.SendAsync(new SendNotificationDto
                    {
                        OwnerId = userId,
                        Title = "You've been outbid 😕",
                        Body = $"Your bid on '{globalItem.Name}' was outbid. Current bid: ₹{dto.NewBid}.",
                        Type = "outbid",
                        Data = new Dictionary<string, string>
                {
                    { "itemId", dto.ItemId.ToString() },
                    { "newBid", dto.NewBid.ToString() }
                }
                    });

                    await _hubContext.Clients.User(userId)
                        .SendAsync("ReceiveNotification", $"⚠️ You've been outbid on '{globalItem.Name}'. New bid: ₹{dto.NewBid}");
                }

                await _itemDbContext.SaveChangesAsync();
                return Ok(new { message = "Bid placed", newBid = dto.NewBid });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RaiseBid error: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpGet("FixedPriceItems")]
        public async Task<IActionResult> GetFixedPriceItems()
        {
            var items = await _itemDbContext.GlobalItems
                .Where(i => i.IsFixedPrice)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost("Place-Order")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var cart = await _itemDbContext.Carts
                .Include(c => c.Items)
                .ThenInclude(ci => ci.Item)
                .FirstOrDefaultAsync(c => c.UserId == dto.UserId);
            if (cart == null || !cart.Items.Any())
            {
                return BadRequest("Your cart is empty.");
            }
            var order = new Order
            {
                UserId = dto.UserId,
                OrderDate = DateTime.UtcNow,
                PaymentMethod = dto.PaymentMethod,
                Address = dto.Address,
                TotalPrice = dto.TotalPrice,
                OrderItems = new List<OrderItem>()
            };
            foreach (var cartItem in cart.Items)
            {
                var orderItem = new OrderItem
                {
                    ItemId = cartItem.ItemId,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.Item.Price
                };
                order.OrderItems.Add(orderItem);
            }
            _itemDbContext.Orders.Add(order);
            _itemDbContext.CartItems.RemoveRange(cart.Items);
            await _itemDbContext.SaveChangesAsync();

            //send invoice 
            var user = await _itemDbContext.Members.FindAsync(dto.UserId);
            if (user != null)
            {
                var pdfBytes = _mailService.GenerateInvoicePdf(order);
                string paymentLink = null;
                if (dto.PaymentMethod == "UPI" && user != null)
                {
                    paymentLink = await _razorPayService.CreatePaymentLinkAsync(order);
                }
                var emailSent = await _mailService.SendInvoiceEmailAsync(
                    toEmail: user.Email,
                    name: user.Name,
                    pdfBytes: pdfBytes,
                    paymentLink: paymentLink
                    );
                if (emailSent)
                {
                    await _notificationService.SendAsync(new SendNotificationDto
                    {
                        OwnerId = user.UserId,
                        Title = "Invoice Sent",
                        Body = $"Your invoice for the order placed has been sent to {user.Email}",
                        Type = "order_invoice"

                    });
                }
            }
            return Ok(new
            {
                message = "Order placed successfully"
            });
        }



    }

}
