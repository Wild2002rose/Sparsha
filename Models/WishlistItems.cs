using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class WishlistItems
    {
        [Key]
        public int WishlistId { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        public Guid ItemId { get; set; }
        [ForeignKey("ItemId")]
        public Items Item { get; set; }
    }
}
