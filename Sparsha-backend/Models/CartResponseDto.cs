namespace Sparsha_backend.Models
{
    public class CartResponseDto
    {
        public List<CartItems> Items { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
