using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class CartItems
    {
        [Key]
        public int CartItemId { get; set; }
        [Required]
        public int CartId { get; set; }
        [ForeignKey("CartId")]
        public Cart Cart { get; set; }
        public Guid ItemId { get; set; }
        [ForeignKey("ItemId")]
        public Items Item { get; set; }
        public int Quantity { get; set; }
        
    }
}
