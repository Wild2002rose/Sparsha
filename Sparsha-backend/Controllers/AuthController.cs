using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using Sparsha_backend.Data;
using Sparsha_backend.Models;
using Sparsha_backend.Services;
using static Sparsha_backend.Controllers.ItemController;

namespace Sparsha_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ItemDbContext _itemDbContext;
        private readonly TwilioService _twilioService;
        private readonly MailService _mailService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IConfiguration _config;

        public AuthController(
            TwilioService twilioService,
            ItemDbContext itemDbContext,
            MailService mailService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext,
            IConfiguration config)
        {
            _itemDbContext = itemDbContext;
            _twilioService = twilioService;
            _mailService = mailService;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _config = config;
        }

        [HttpPost("save-token")]
        //[Authorize]
        public async Task<IActionResult> SaveToken([FromBody] DeviceTokenDto dto)
        {
            //var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            //if (string.IsNullOrEmpty(userId))
            //    return Unauthorized();
            var user = await _itemDbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == dto.UserId);
            if (user == null) return NotFound();
            user.DeviceToken = dto.DeviceToken;
            await _itemDbContext.SaveChangesAsync();
            return Ok("✅ Device token saved");
        }

        [HttpPost("sendCode")]
        public async Task<IActionResult> SendCode([FromBody] EmailRequest request)
        {
            try
            {
                if (await _mailService.SendVerificationEmailAsync(request.Email, request.Name))
                    return Ok(new { message = "Verification code sent!" });

                return StatusCode(500, new { message = "Failed to send email." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMTP ERROR: {ex}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("checkCode")]
        public IActionResult CheckCode([FromBody] EmailVerify request)
        {
            if (_mailService.VerifyCode(request.Email, request.Code))
                return Ok(new { message = "Verification successful!" });

            return BadRequest(new { message = "Invalid or expired code." });
        }

        [HttpPost("RegisterSeller")]
        public async Task<IActionResult> RegisterSeller([FromBody] SellerReg request)
        {
            if (request == null)
            {
                return BadRequest("Invalid Data");
            }
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest("Passwords do not match.");
            }
            try
            {
                var existingSeller = await _itemDbContext.Sellers.FirstOrDefaultAsync(s => s.Email == request.Email);
                if (existingSeller != null)
                {
                    return BadRequest("A user with this email already exists.");
                }
                string sellerId = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var member = new Member
                {
                    UserId = sellerId,
                    Email = request.Email,
                    Name = request.Name,
                    Password = hashedPassword,
                    Address = request.Address,
                    MobileNumber = request.MobileNumber,
                    PinCode = request.Pincode,
                    Role = "Seller"
                };
                await _itemDbContext.Members.AddAsync(member);
                var seller = new Seller
                {
                    Name = request.Name,
                    SellerId = sellerId,
                    StoreName = request.StoreName,
                    Email = request.Email,
                    MobileNumber = request.MobileNumber,
                    Address = request.Address,
                    BusinessType = request.BusinessType,
                    Pincode = request.Pincode,
                    Password = hashedPassword
                };
                await _itemDbContext.Sellers.AddAsync(seller);
                await _itemDbContext.SaveChangesAsync();

                var mailService = new MailService();
                await mailService.SendSellerIdAsync(request.Email, request.Name, seller.SellerId);

                return Ok(new { message = "Registration successful." });
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                    return StatusCode(500, $"Error during registration :{ex.InnerException.Message}");
                }
                return StatusCode(500, $"Error during registration:{ex.Message}");
            }

        }

        [HttpPost("RegisterClient")]
        public async Task<IActionResult> RegisterClient([FromBody] ClientReg request)
        {
            if (request == null)
                return BadRequest("Invalid data");
            if (request.Password != request.ConfirmPassword)
                return BadRequest("Passwords do not match.");
            try
            {
                var existingClient = await _itemDbContext.Members.FirstOrDefaultAsync(m => m.Email == request.Email);
                if (existingClient != null)
                    return BadRequest("A user with this email already exists.");
                string clientId = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var member = new Member
                {
                    UserId = clientId,
                    Email = request.Email,
                    Name = request.Name,
                    Password = hashedPassword,
                    Address = request.Address,
                    MobileNumber = request.MobileNumber,
                    PinCode = request.Pincode,
                    Role = "Client",
                };
                await _itemDbContext.Members.AddAsync(member);
                var client = new Client
                {
                    Name = request.Name,
                    ClientId = clientId,
                    Email = request.Email,
                    MobileNumber = request.MobileNumber,
                    Address = request.Address,
                    Pincode = request.Pincode,
                    Password = hashedPassword
                };
                await _itemDbContext.Clients.AddAsync(client);
                await _itemDbContext.SaveChangesAsync();
                var mailService = new MailService();
                await mailService.SendSellerIdAsync(request.Email, request.Name, client.ClientId);
                return Ok(new { message = "Registration successful." });
            } catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                    return StatusCode(500, $"Error during registration :{ex.InnerException.Message}");
                }
                return StatusCode(500, $"Error during registration:{ex.Message}");
            }
        }


        [HttpPost("Sellerlogin")]
        public async Task<IActionResult> SellerLogin([FromBody] SellerLogin login)
        {
            var seller = await _itemDbContext.Sellers
                .FirstOrDefaultAsync(s => s.SellerId == login.SellerId);

            if (seller == null)
                return Unauthorized("Invalid SellerId or Password.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(login.Password, seller.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid SellerId or Password.");

            var log = new LoginLog
            {
                SellerId = login.SellerId,
                Status = (seller != null && isPasswordValid) ? "Success" : "Failed",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
            };
            _itemDbContext.LoggedSellers.Add(log);
            await _itemDbContext.SaveChangesAsync();

            await _notificationService.SendAsync(new SendNotificationDto
            {
                OwnerId = seller.SellerId,
                Title = "You logged in",
                Body = $"Welcome back ,{seller.Name}",
                Type = "Login"
            });
            await _hubContext.Clients.User(seller.SellerId).SendAsync("ReciedNotification", $"🔐 Hello {seller.Name}, you're now logged in!");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("SellerId", seller.SellerId),
                    new Claim(ClaimTypes.Name, seller.Name),
                    new Claim(ClaimTypes.Email, seller.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            string jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = jwt,
                sellerId = seller.SellerId,
                name = seller.Name,
                email = seller.Email
            });
        }

        [HttpPost("Clientlogin")]
        public async Task<IActionResult> ClientLogin([FromBody] ClientLogin login)
        {
            var client = await _itemDbContext.Clients
                .FirstOrDefaultAsync(c => c.ClientId == login.ClientId);

            if (client == null)
                return Unauthorized("Invalid SellerId or Password.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(login.Password, client.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid SellerId or Password.");

            var log = new ClientLoginLog
            {
                ClientId = login.ClientId,
                Status = (client != null && isPasswordValid) ? "Success" : "Failed",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
            };
            _itemDbContext.LoggedClients.Add(log);
            await _itemDbContext.SaveChangesAsync();

            await _notificationService.SendAsync(new SendNotificationDto
            {
                OwnerId = client.ClientId,
                Title = "You logged in",
                Body = $"Welcome back ,{client.Name}",
                Type = "Login"
            });
            await _hubContext.Clients.User(client.ClientId).SendAsync("ReciedNotification", $"🔐 Hello {client.Name}, you're now logged in!");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("ClientID", client.ClientId),
                    new Claim(ClaimTypes.Name, client.Name),
                    new Claim(ClaimTypes.Email, client.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            string jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = jwt,
                clientId = client.ClientId,
                name = client.Name,
                email = client.Email
            });
        }

        [HttpGet("Profile/{userId}")]
        public async Task<IActionResult> GetProfile(string userId)
        {
            var member = await _itemDbContext.Members
                .FindAsync(userId);
            if (member == null)
            {
                return NotFound("Member not found");
            }
            var client = await _itemDbContext.Clients.FirstOrDefaultAsync(c => c.ClientId == userId);
            var seller = await _itemDbContext.Sellers.FirstOrDefaultAsync(s => s.SellerId == userId);
            return Ok(new
            {
                member.UserId,
                member.Email,
                member.MobileNumber,
                member.Address,
                member.PinCode,
                Role = client != null ? "Client" : seller != null ? "Seller" : "Unknown",
                Name = client?.Name ?? seller?.Name,
            });
        }

        [HttpGet("GetEmail/{userId}")]
        public async Task<IActionResult> GetEmail(string userId)
        {
            var user = await _itemDbContext.Sellers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.SellerId == userId);
            if (user == null)
            {
                return NotFound(new { message = "user not found" });
            }
            return Ok(new { email = user.Email });
        }

        



    }
}
