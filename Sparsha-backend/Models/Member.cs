using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    [Table ("Member")]
    public class Member
    {
        [Key]
        public string UserId { get; set; }
        public String Name { get; set; }
        public String Email { get; set; }
        public String MobileNumber { get; set; }
        public String Address { get; set; }
        public string PinCode { get; set; }
        public String Password { get; set; }
        public string Role { get; set; }
        public Seller Seller { get; set; }
        public Client Client { get; set; }
    }
}
