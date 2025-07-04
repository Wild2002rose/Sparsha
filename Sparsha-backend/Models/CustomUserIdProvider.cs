using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Sparsha_backend.Models
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst("SellerId")?.Value
            ?? connection.User?.FindFirst("ClientId")?.Value
            ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }

}
