using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using Sparsha_backend.Data;
using Sparsha_backend.Models;
using Sparsha_backend.Services;

namespace Sparsha_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ItemDbContext _itemDbContext;
        private readonly TwilioService _twilioService;
        private readonly MailService _mailService;

        public AuthController (TwilioService twilioService, ItemDbContext itemDbContext, MailService mailService)
        {
            _itemDbContext = itemDbContext;
            _twilioService = twilioService;
            _mailService = mailService;
        }

        //[HttpPost("Send_Otp")]
        //public async Task<IActionResult> SendOtp([FromBody] GetOtp request)
        //{
        //    if (request == null || string.IsNullOrWhiteSpace(request.MobileNumber))
        //    {
        //        return BadRequest("Mobile number is required");
        //    }
        //    try
        //    {
        //        var result = await _twilioService.SendOtpAsync(request.MobileNumber, "Your OTP for Astha registration");
        //        if (!string.IsNullOrEmpty(result))
        //        {
        //            return Ok(new { msg = "OTP sent to your mobile number" });
        //        }
        //        return StatusCode(500, "Failed to send OTP");
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Error sending OTP:{ex.Message}");
        //    }
        //}


        //[HttpPost("Verify_Otp")]
        //public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtp request)
        //{
        //    if(request == null || string.IsNullOrWhiteSpace(request.MobileNumber) || string.IsNullOrWhiteSpace(request.Otp))
        //    {
        //        return BadRequest("Mobile Number and Otp are not valid.");
        //    }
        //    try
        //    {
        //        bool isVerified = await _twilioService.VerifyOtpAsync(request.MobileNumber, request.Otp);
        //        if (isVerified)
        //        {
        //            return Ok(new { msg = "OTP verified successfully" });
        //        }
        //        else
        //        {
        //            return BadRequest(new {msg= "OTP is invalid or Expired OTP" });
        //        }
        //    }
        //    catch(Exception ex)
        //    {
        //        return StatusCode(500, $"Error verifying OTP: {ex.Message}");
        //    }
        //}

        //[HttpPost("Register")]
        //public async Task<IActionResult> Register([FromBody] Register request)
        //{
        //    if (request == null)
        //    {
        //        return BadRequest("Invalid Data");
        //    }
        //    if (request.Password != request.ConfirmPassword)
        //    {
        //        return BadRequest("Passwords do not match.");
        //    }
        //    try
        //    {

        //        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        //        var member = new Member { 
        //            FirstName = request.FirstName, 
        //            LastName = request.LastName, 
        //            Email = request.Email, 
        //            MobileNumber = request.MobileNumber, 
        //            Password = hashedPassword,
        //            Address = request.Address,
        //        };
        //        await _itemDbContext.Members.AddAsync(member);
        //        await _itemDbContext.SaveChangesAsync();

        //        await _twilioService.SendSmsAsync(request.MobileNumber,
        //            $"Your registratoin is successful. Welcome to our Sparsha Family!");

        //        return Ok(new {message= "User registered successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        if(ex.InnerException != null)
        //        {
        //            return StatusCode(500, $"Error during registration: {ex.InnerException.Message}");
        //        }
        //        return StatusCode(500, $"Error during registration: {ex.Message}");
        //    }
        //}

        [HttpPost("sendCode")]
        public async Task<IActionResult> SendCode([FromBody] EmailRequest request)
        {
            try
            {
                if (await _mailService.SendVerificationEmailAsync(request.Email, request.Name))
                    return Ok(new { message = "Verification code sent!" });

                return StatusCode(500, new { message = "Failed to send email." });
            }
            catch(Exception ex)
            {
                Console.WriteLine($"SMTP ERROR: {ex}");
                return StatusCode(500, new {message = "Internal server error"});
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
            if(request == null)
            {
                return BadRequest("Invalid Data");
            }
            if(request.Password != request.ConfirmPassword)
            {
                return BadRequest("Passwords do not match.");
            }
            try
            {
                var existingSeller = await _itemDbContext.Sellers.FirstOrDefaultAsync(s => s.Email == request.Email);
                if(existingSeller != null)
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
                if(ex.InnerException != null)
                {
                    return StatusCode(500, $"Error during registration :{ ex.InnerException.Message}");
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
                if(existingClient != null)
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


            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("MyUltraSecureJWTSecretKey!1234567890");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim("SellerId", seller.SellerId),
            new Claim(ClaimTypes.Name, seller.Name),
            new Claim(ClaimTypes.Email, seller.Email)
        }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = "yourdomain.com",
                Audience = "yourdomain.com",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            string jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token,
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


            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("MyUltraSecureJWTSecretKey!1234567890");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim("ClientId", client.ClientId),
            new Claim(ClaimTypes.Name, client.Name),
            new Claim(ClaimTypes.Email, client.Email)
        }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = "yourdomain.com",
                Audience = "yourdomain.com",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            string jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token,
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
            if(member == null)
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
            if(user == null)
            {
                return NotFound(new { message = "user not found" });
            }
            return Ok(new { email = user.Email });
        }


    }
}
