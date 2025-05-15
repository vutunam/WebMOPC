using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class MedicalAppointment
{
    public int Id { get; set; }

    public DateTime? MedicalDateStart { get; set; }

    public string? Note { get; set; }

    public int? PatientId { get; set; }

    public bool? IsDeleted { get; set; }

    public int? Status { get; set; }

    public int? DiagnoseId { get; set; }

    public DateTime? MedicalDateEnd { get; set; }

    public bool? MedicalType { get; set; }

    public DateTime? CreatedDate { get; set; }

    public bool? IsDoned { get; set; }

    public string? CreatedBy { get; set; }
}
