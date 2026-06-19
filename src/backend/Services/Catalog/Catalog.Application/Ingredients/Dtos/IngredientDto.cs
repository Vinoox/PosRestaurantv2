using System;
using Catalog.Domain.Enums;

namespace Catalog.Application.Ingredients.Dtos;

public class IngredientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Unit Unit { get; set; }
    public decimal StockQuantity { get; set; }
}