using System;

namespace Catalog.Application.Products.Dtos;

public record ProductIngredientDto
{
    public Guid IngredientId { get; init; }
    public string IngredientName { get; init; } = string.Empty;
    public string Unit { get; init; } = "szt";
    public decimal QuantityUsed { get; init; }
}