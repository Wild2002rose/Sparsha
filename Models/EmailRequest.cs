using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class EmailRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        //[Required]
        //public string MobileNumber { get; set; }
        [Required]
        public string Name { get; set; }
        //[Required]
        //public string StoreName { get; set; }
        //[Required]
        //public string BusinessType { get; set; }
        //[Required]
        //public string Address { get; set; }
        //[Required]
        //public string Pincode { get; set; }
    }
}
