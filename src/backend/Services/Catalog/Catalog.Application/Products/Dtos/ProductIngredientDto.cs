using System;

namespace Catalog.Application.Products.Dtos;

public class ProductIngredientDto
{
    public Guid IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal QuantityUsed { get; set; }
}