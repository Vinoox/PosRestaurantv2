using System;
using System.Collections.Generic;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Entities;

public class Category : BaseAuditableEntity, IMultiTenantEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid RestaurantId { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}