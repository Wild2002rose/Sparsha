using System.ComponentModel.DataAnnotations;

namespace Sparsha_backend.Models
{
    public class EmailVerify
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Code { get; set; }
    }
}
