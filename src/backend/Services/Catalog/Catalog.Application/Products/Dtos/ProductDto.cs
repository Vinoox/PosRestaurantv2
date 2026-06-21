using System;
using System.Collections.Generic;

namespace Catalog.Application.Products.Dtos;

public record ProductDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public Guid CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public bool IsAvailable { get; init; }
    public List<ProductIngredientDto> Ingredients { get; init; } = new();
}