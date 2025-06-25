namespace Sparsha_backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string OwnerId { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
