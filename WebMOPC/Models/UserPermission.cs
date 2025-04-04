using System;
using System.Collections.Generic;

namespace WebMOPC.Models;

public partial class UserPermission
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public int? RoleFeatureId { get; set; }

    public int? FeatureId { get; set; }
}
