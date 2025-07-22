namespace Sparsha_backend.Models
{
    public class RazorpayOrderDto
    {
        public int Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Receipt { get; set; }
    }
}
