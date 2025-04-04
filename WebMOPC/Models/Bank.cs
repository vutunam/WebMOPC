using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class Bank
{
    public int Id { get; set; }

    public string? Bin { get; set; }

    public string? Code { get; set; }

    public string? Name { get; set; }

    public string? ShortName { get; set; }

    public string? Logo { get; set; }
}
