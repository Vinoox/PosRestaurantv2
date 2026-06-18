using System;
using System.Collections.Generic;
using Catalog.Application.Products.Commands.CreateProduct;

namespace Catalog.API.Contracts;

public record CreateProductRequest(
    string Name,
    string? Description,
    decimal Price,
    Guid CategoryId,
    List<ProductIngredientRequestDto> Ingredients);