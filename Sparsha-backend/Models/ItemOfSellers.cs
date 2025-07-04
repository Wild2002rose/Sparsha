using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class ItemOfSellers
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public Guid? ItemId { get; set; }
        [ForeignKey("ItemId")]
        public Items Item { get; set; }
        public string SellerId { get; set; }
        public Seller Seller { get; set; }
        public string Name { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public int MyPrice { get; set; }
        public int CurrentBid { get; set; }
        public bool IsFixedPrice { get; set; }
        public string ImagePath { get; set; }
    }
}
