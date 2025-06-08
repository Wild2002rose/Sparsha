using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class Client
    {
        [Key]
        public string ClientId { get; set; }
        public String Name { get; set; }
        public String Email { get; set; }
        public String MobileNumber { get; set; }
        public String Address { get; set; }
        public String Pincode { get; set; }
        public String Password { get; set; }
        public Member Member { get; set; }
    }
}
