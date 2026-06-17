using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.DeleteRestaurantRole
{
    public record DeleteRestaurantRoleCommand(Guid RestaurantId, Guid RoleId, Guid RequesterId) : IRequest<Unit>;
}