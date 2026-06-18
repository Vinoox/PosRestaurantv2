using System;
using Catalog.Application.Ingredients.Dtos;
using Catalog.Domain.Enums;
using MediatR;
using Unit = Catalog.Domain.Enums.Unit;

namespace Catalog.Application.Ingredients.Commands.CreateIngredient;

public record CreateIngredientCommand(
    string Name,
    Unit Unit,
    decimal InitialStock,
    Guid RestaurantId) : IRequest<IngredientDto>;