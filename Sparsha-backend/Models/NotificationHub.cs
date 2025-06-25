using Microsoft.AspNetCore.SignalR;

namespace Sparsha_backend.Models
{
    public class NotificationHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"User connected: {Context.UserIdentifier}");
            return base.OnConnectedAsync();
        }
    }
}
