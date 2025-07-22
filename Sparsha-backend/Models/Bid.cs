namespace Sparsha_backend.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public Guid ItemId { get; set; }
        public string UserId { get; set; }
        public int Amount { get; set; }
        public DateTime BidTime { get; set; }
        public Items Item { get; set; }
    }
}
