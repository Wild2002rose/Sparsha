namespace Sparsha_backend.Models
{
    public class AddToWishlistDto
    {
        public string UserId { get; set; }
        public Guid ItemId { get; set; }
    }
}
