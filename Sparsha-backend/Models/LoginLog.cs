namespace Sparsha_backend.Models
{
    public class LoginLog
    {
        public int Id { get; set; }
        public string SellerId { get; set; }
        public string Status { get; set; } 
        public DateTime Timestamp { get; set; }
        public string IpAddress { get; set; }
    }
}
