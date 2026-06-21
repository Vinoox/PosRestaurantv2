using System;
using System.Collections.Generic;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Entities;

public class Product : BaseAuditableEntity, IMultiTenantEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsAvailable { get; set; } = true;

    public ICollection<ProductIngredient> ProductIngredients { get; set; } = new List<ProductIngredient>();
}