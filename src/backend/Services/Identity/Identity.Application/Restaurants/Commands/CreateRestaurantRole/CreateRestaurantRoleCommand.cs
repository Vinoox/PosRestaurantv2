using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.CreateRestaurantRole;

public record CreateRestaurantRoleCommand(
    Guid RestaurantId,
    string Name,
    Guid RequesterId) : IRequest<Guid>;