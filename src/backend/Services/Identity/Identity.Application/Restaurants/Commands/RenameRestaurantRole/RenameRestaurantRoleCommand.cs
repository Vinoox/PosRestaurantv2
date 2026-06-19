using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.RenameRestaurantRole;

public record RenameRestaurantRoleCommand(
    Guid RestaurantId,
    Guid RoleId,
    string NewName,
    Guid RequesterId) : IRequest<Unit>;