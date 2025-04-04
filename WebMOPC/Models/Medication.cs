using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Medication
{
    public int Id { get; set; }

    public string? Code { get; set; }

    public string? Name { get; set; }

    public int? Status { get; set; }

    public decimal? Quantity { get; set; }

    public string? Supplier { get; set; }

    public decimal? Price { get; set; }

    public bool? IsDeleted { get; set; }

    public string? Note { get; set; }
}
