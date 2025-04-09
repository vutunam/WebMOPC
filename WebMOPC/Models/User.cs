using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class User
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? LoginName { get; set; }

    public string? Password { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public int? Status { get; set; }

    public bool? IsDeleted { get; set; }

    public string? Avatar { get; set; }

    public bool? IsAdmin { get; set; }
}
