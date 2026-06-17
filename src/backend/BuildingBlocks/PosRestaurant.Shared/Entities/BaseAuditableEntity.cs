using System;

namespace PosRestaurant.Shared.Entities;

public abstract class BaseAuditableEntity : BaseEntity
{
    public Guid Id {  get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
}