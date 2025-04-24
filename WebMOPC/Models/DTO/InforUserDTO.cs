using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.Models.DTO
{
    public class InforUserDTO 
    {
        public string LoginName { get; set; }
        public string? FullName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public bool? Gender { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Email { get; set; }

        public string? Cccd { get; set; }
        public int? HealthInsurance { get; set; }
        public string? Description { get; set; }
        public string? Education { get; set; }
    }
}
