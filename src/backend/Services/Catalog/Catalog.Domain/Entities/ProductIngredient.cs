using System;

namespace Catalog.Domain.Entities;
public class ProductIngredient
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!;
    public decimal QuantityUsed { get; set; }
}