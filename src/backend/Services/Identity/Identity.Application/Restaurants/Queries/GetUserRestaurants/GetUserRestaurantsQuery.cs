using System;
using System.Collections.Generic;
using MediatR;

namespace Identity.Application.Restaurants.Queries.GetUserRestaurants
{
    public record GetUserRestaurantsQuery(Guid UserId) : IRequest<List<RestaurantDto>>;
}