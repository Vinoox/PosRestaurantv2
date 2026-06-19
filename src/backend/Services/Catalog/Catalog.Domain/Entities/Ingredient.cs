using System;
using System.Collections.Generic;
using Catalog.Domain.Enums;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Entities;

public class Ingredient : BaseAuditableEntity, IMultiTenantEntity
{
    public required string Name { get; set; }
    public Unit Unit { get; set; }
    public decimal StockQuantity { get; set; }

    public Guid RestaurantId { get; set; }

    public ICollection<ProductIngredient> ProductIngredients { get; set; } = new List<ProductIngredient>();
}