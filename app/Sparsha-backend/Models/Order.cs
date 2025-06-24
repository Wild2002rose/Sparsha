using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        [Required]
        public string UserId { get; set; }
        public string Address { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        [Required]
        public string PaymentMethod { get; set; }
        public List<CartItems> CartItems { get; set; }
        public decimal TotalPrice { get; set; }
        public List<OrderItem> OrderItems { get; internal set; }
    }
}
