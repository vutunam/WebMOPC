using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Prescription
{
    public int Id { get; set; }

    public int? InvoiceId { get; set; }

    public int? MedicationId { get; set; }

    public int? Quantity { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }
}
