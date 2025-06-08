namespace Sparsha_backend.Models
{
    public class CartResponseDto
    {
        public List<CartItemDto> Items { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
