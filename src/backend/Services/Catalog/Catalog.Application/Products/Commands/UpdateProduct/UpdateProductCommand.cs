using System;
using System.Collections.Generic;
using Catalog.Application.Products.Commands.CreateProduct;
using MediatR;

namespace Catalog.Application.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    Guid CategoryId,
    Guid RestaurantId,
    List<ProductIngredientRequestDto> Ingredients) : IRequest;