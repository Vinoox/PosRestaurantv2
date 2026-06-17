using System;
using System.Collections.Generic;
using MediatR;

namespace Identity.Application.Restaurants.Queries.GetRestaurantRoles
{
    public record GetRestaurantRolesQuery(Guid RestaurantId, Guid RequesterId) : IRequest<List<RestaurantRoleDto>>;
}