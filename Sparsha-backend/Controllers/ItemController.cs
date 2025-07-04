using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sparsha_backend.Data;
using Sparsha_backend.Models;
using FirebaseAdmin.Messaging;
using Notification = Sparsha_backend.Models.Notification;
using Sparsha_backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
        public ItemController(ItemDbContext itemDbContext, MailService mailService, INotificationService notificationService, IHubContext<NotificationHub> hubContext)
        {
            _itemDbContext = itemDbContext;
            _mailService = mailService;
            _notificationService = notificationService;
            _hubContext = hubContext;
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
                i.Description
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
                CurrentBid = item.CurrentBid,
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
                IsFixedPrice = item.IsFixedPrice
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
            var items = await _itemDbContext.GlobalItems
                .Where(x => x.ItemId == parsedItemId).ToListAsync();
            return Ok(items);
        }

        [HttpPost("wishlist/add")]
        public async Task<IActionResult> AddToWishList([FromBody] AddToWishlistDto dto)
        {
            try
            {
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

        [HttpPost("Place-Order")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var cart = await _itemDbContext.Carts
                .Include(c => c.Items)
                .ThenInclude(ci => ci.Item)
                .FirstOrDefaultAsync( c => c.UserId == dto.UserId);
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
            return Ok(new { message = "Order placed successfully" });
        }

        [HttpPost("Send-code")]
        public async Task<IActionResult> SendCode([FromBody] CodeRequest request)
        {
            var seller = await _itemDbContext.Sellers.FirstOrDefaultAsync(s => s.SellerId == request.UserId);
            if(seller == null || string.IsNullOrEmpty(seller.Email))
            {
                return BadRequest("Seller not found or email is missing");
            }
            var code = _mailService.GenerateVerificationCode();

            bool result = await _mailService.SendCode(seller.Email, seller.Name, code);
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

                globalItem.CurrentBid = (globalItem.CurrentBid ?? 0) + dto.NewBid;
                var sellerItem = await _itemDbContext.ItemOfSellers
                    .FirstOrDefaultAsync(x => x.ItemId == dto.ItemId);
                if (sellerItem == null)
                {
                    Console.WriteLine("Seller item not found");
                }
                else
                {
                    if (sellerItem.SellerId == dto.UserId)
                        return BadRequest("You can't bid on your own item");
                    sellerItem.CurrentBid += dto.NewBid;

                    await _notificationService.SendAsync(new SendNotificationDto
                    {
                        OwnerId = sellerItem.SellerId,
                        Title = "New Bid Alert! 🎯",
                        Body = $"New bid of ₹{dto.NewBid} on your item '{globalItem.Name}'.",
                        Type = "bid",
                        Data = new Dictionary<string, string>
                        {
                            { "itemId", dto.ItemId.ToString() },
                            { "newBid", dto.NewBid.ToString() }
                        }
                    });
                    await _hubContext.Clients.User(sellerItem.SellerId)
                    .SendAsync("ReceiveNotification", $"💰 New bid of ₹{dto.NewBid} on your item '{globalItem.Name}'");
                }
                await _itemDbContext.SaveChangesAsync();
                Console.WriteLine("Adding notification...");
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





    }

}
