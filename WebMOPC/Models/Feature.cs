using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Feature
{
    public int Id { get; set; }

    public string? Code { get; set; }

    public string? Name { get; set; }

    public DateTime? CreatedDate { get; set; }

    public bool? IsDeleted { get; set; }
}
