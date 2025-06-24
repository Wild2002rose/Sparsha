using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class Cart
    {
        [Key]
        public int CartId { get; set; }
        [Required]
        public string UserId { get; set; }
        public List<CartItems> Items { get; set; } = new List<CartItems>();
    }
}
