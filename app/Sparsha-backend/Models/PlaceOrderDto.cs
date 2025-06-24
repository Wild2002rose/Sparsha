using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class PlaceOrderDto
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string PaymentMethod { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public decimal TotalPrice { get; set; }

    }
}
