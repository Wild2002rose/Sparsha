using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class Seller
    {
        [Key]
        public string SellerId { get; set; }
        public String Name { get; set; }
        public String StoreName { get; set; }
        public String Email { get; set; }
        public String MobileNumber { get; set; }
        public String BusinessType { get; set; }
        public String Address { get; set; }
        public String Pincode { get; set; }
        public String Password { get; set; }
        public ICollection<ItemOfSellers> ItemOfSellers { get; set; }
    }
}
