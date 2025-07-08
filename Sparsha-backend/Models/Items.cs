using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class Items
    {
        [Key]
        public Guid ItemId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public int Price { get; set; }
        public int? CurrentBid { get; set; }
        public string ImagePath { get; set; }
    }
}
