namespace Sparsha_backend.Models
{
    public class ClientLoginLog
    {
        public int Id { get; set; }
        public string ClientId { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }
        public string IpAddress { get; set; }
    }
}
