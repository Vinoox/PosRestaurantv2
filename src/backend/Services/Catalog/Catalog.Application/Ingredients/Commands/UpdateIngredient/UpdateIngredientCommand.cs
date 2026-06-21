using System;
using Catalog.Domain.Enums;
using MediatR;
using Unit = Catalog.Domain.Enums.Unit;

namespace Catalog.Application.Ingredients.Commands.UpdateIngredient;

public record UpdateIngredientCommand(
    Guid Id,
    string Name,
    Unit Unit,
    decimal StockQuantity,
    Guid RestaurantId) : IRequest;