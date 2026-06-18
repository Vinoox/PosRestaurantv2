using System;
using System.Collections.Generic;
using Catalog.Application.Products.Dtos;
using MediatR;

namespace Catalog.Application.Products.Commands.CreateProduct;
public record ProductIngredientRequestDto(Guid IngredientId, decimal QuantityUsed);

public record CreateProductCommand(
    string Name,
    string? Description,
    decimal Price,
    Guid CategoryId,
    Guid RestaurantId,
    List<ProductIngredientRequestDto> Ingredients) : IRequest<ProductDto>;