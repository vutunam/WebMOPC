using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Diagnosis
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public int? Status { get; set; }

    public bool? IsDeleted { get; set; }

    public string? Description { get; set; }

    public string? Conclusion { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedDate { get; set; }
}
