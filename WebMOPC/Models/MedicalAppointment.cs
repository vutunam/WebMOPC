﻿using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class MedicalAppointment
{
    public int Id { get; set; }

    public DateTime? MedicalDate { get; set; }

    public string? Note { get; set; }

    public int? PatientId { get; set; }

    public bool? IsDeleted { get; set; }

    public int? Status { get; set; }

    public int? InvoiceId { get; set; }

    public int? DiagnoseId { get; set; }

    public int? DoctorId { get; set; }
}
