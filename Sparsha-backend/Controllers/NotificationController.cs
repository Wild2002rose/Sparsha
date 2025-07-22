using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sparsha_backend.Data;
using Sparsha_backend.Services;

namespace Sparsha_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly ItemDbContext _itemDbContext;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationController(
            ItemDbContext itemDbContext, 
            INotificationService notificationService, 
            IHubContext<NotificationHub> hubContext)
        {
            _itemDbContext = itemDbContext;
            _notificationService = notificationService;
            _hubContext = hubContext;
        }

        [HttpPost("SendLoginNotification")]
        public async Task SendLoginNotification(string userId, string message)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", message);
        }

        [HttpGet("GetNotification/{userId}")]
        public async Task<IActionResult> GetNotification(string userId)
        {
            var notifications = await _itemDbContext.Notifications
                .Where(n => n.OwnerId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            if (notifications == null || !notifications.Any())
            {
                return NotFound(new { message = "No notifications found" });
            }

            return Ok(notifications);
        }

        [HttpPut("MarkNotificationAsRead/{notificationId}")]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId)
        {
            var notification = await _itemDbContext.Notifications.FindAsync(notificationId);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found" });
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                _itemDbContext.Notifications.Update(notification);
                await _itemDbContext.SaveChangesAsync();
            }

            return Ok(new { message = "Notification marked as read", notificationId });
        }

        [HttpPut("MarkAllAsRead/{userId}")]
        public async Task<IActionResult> MarkAllAsRead(string userId)
        {
            var notifications = await _itemDbContext.Notifications
                .Where(n => n.OwnerId == userId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any())
                return Ok(new { message = "No unread notifications" });

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _itemDbContext.SaveChangesAsync();

            return Ok(new { message = "All notifications marked as read" });
        }

        [HttpDelete("DeleteNotification/{notificationId}")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            var notification = await _itemDbContext.Notifications.FindAsync(notificationId);
            if (notification == null)
                return NotFound(new { message = "Notification not found" });

            _itemDbContext.Notifications.Remove(notification);
            await _itemDbContext.SaveChangesAsync();

            return Ok(new { message = "Notification deleted" });
        }

        [HttpDelete("DeleteAllNotifications/{userId}")]
        public async Task<IActionResult> DeleteAllNotifications(string userId)
        {
            var notifications = await _itemDbContext.Notifications
                .Where(n => n.OwnerId == userId)
                .ToListAsync();

            if (!notifications.Any())
                return Ok(new { message = "No notifications to delete" });

            _itemDbContext.Notifications.RemoveRange(notifications);
            await _itemDbContext.SaveChangesAsync();

            return Ok(new { message = "All notifications deleted" });
        }


    }
}
