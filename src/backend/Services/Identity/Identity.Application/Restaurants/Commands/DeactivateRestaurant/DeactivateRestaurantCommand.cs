using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.DeactivateRestaurant;

public record DeactivateRestaurantCommand(
    Guid RestaurantId,
    Guid RequesterId) : IRequest<Unit>;