using System;
using System.Collections.Generic;
using Catalog.Application.Ingredients.Dtos;
using MediatR;

namespace Catalog.Application.Ingredients.Queries.GetIngredients;

public record GetIngredientsQuery(Guid RestaurantId) : IRequest<IEnumerable<IngredientDto>>;