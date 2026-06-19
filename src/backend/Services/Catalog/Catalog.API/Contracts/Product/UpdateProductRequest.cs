using System;
using System.Collections.Generic;
using Catalog.Application.Products.Commands.CreateProduct;

namespace Catalog.API.Contracts.Product;

public record UpdateProductRequest(
    string Name,
    string? Description,
    decimal Price,
    Guid CategoryId,
    List<ProductIngredientRequestDto> Ingredients);