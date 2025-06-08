using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    [Table ("Member")]
    public class Member
    {
        [Key]
        public int Id { get; set; }
        public String FirstName { get; set; }
        public String LastName { get; set; }
        public String Email { get; set; }
        public String MobileNumber { get; set; }
        public String Address { get; set; }
        public String Password { get; set; }
    }
}
