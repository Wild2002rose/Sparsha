using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace Sparsha_backend.Models
{
    public class UploadItem
    {
        public string SellerId { get; set; }
        public string Name { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public int MyPrice { get; set; }
        public int ? CurrentBid { get; set; }
        [NotMapped]
        public IFormFile Image { get; set; }
        [NotMapped]
        public string? ImagePath { get; set; }
        public bool IsFixedPrice { get; set; }
    }
}
