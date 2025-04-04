using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Invoice
{
    public int Id { get; set; }

    public string? Code { get; set; }

    public string? Name { get; set; }

    public string? CreatedBy { get; set; }

    public string? Contents { get; set; }

    public DateTime? CreatedDate { get; set; }

    public bool? IsDeleted { get; set; }

    public int? Status { get; set; }

    public string? Note { get; set; }

    public int? ServiceTypeId { get; set; }

    public int? PaymentBankId { get; set; }

    public int? PaymentType { get; set; }

    public int? PrescriptionId { get; set; }
}
