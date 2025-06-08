using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }
        [Required]
        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order Order { get; set; }
        public Guid ItemId { get; set; }
        [ForeignKey("ItemId")]
        public Items Item { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }

    }
}
