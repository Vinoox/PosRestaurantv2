using System;
using MediatR;

namespace Catalog.Application.Ingredients.Commands.DeleteIngredient;

public record DeleteIngredientCommand(Guid Id, Guid RestaurantId) : IRequest;