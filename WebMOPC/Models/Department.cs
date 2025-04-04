using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Department
{
    public int Id { get; set; }

    public string? Code { get; set; }

    public string? Name { get; set; }

    public int? HeadId { get; set; }

    public string? Address { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedDate { get; set; }
}
