using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sparsha_backend.Models
{
    public class GetOtp
    {
        [Required]
        public string MobileNumber { get; set; }
    }
}
