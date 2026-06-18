using System;
using Catalog.Application.Ingredients.Dtos;
using MediatR;

namespace Catalog.Application.Ingredients.Queries.GetIngredientById;

public record GetIngredientByIdQuery(Guid Id, Guid RestaurantId) : IRequest<IngredientDto>;