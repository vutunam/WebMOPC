using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class InvoiceDetail
{
    public int Id { get; set; }

    public int? ServiceTypeId { get; set; }

    public decimal? Quantity { get; set; }

    public decimal? Price { get; set; }

    public int? InvoiceId { get; set; }

    public int? DepartmentId { get; set; }

    public int? DoctorId { get; set; }
}
