using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Patient
{
    public int Id { get; set; }

    public string? Code { get; set; }

    public string? FullName { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public bool? Gender { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? Email { get; set; }

    public string? Cccd { get; set; }

    public int? MedicalStatus { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? HealthInsurance { get; set; }

    public int? UserId { get; set; }
}
