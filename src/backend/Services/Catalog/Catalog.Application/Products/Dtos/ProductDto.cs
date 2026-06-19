using System;
using System.Collections.Generic;

namespace Catalog.Application.Products.Dtos;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }

    public List<ProductIngredientDto> Ingredients { get; set; } = new();
}