namespace Sparsha_backend.Models
{
    public class LockBiddingDto
    {
        public Guid ItemID { get; set; }
        public string SellerId { get; set; }
        public bool Lock { get; set; }
    }
}
