using Microsoft.AspNetCore.SignalR;

public class NotificationHub : Hub
{
    public override Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        Console.WriteLine($"User connected: {userId}");
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception ex)
    {
        var userId = Context.UserIdentifier;
        Console.WriteLine($"User disconnected: {userId}");
        return base.OnDisconnectedAsync(ex);
    }
}
