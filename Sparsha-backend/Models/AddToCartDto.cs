namespace Sparsha_backend.Models
{
    public class AddToCartDto
    {
        public int CartItemId { get; set; }
        public Guid ItemId { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }
    }
}
