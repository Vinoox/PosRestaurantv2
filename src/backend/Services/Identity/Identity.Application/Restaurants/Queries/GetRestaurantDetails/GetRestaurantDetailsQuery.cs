using System;
using MediatR;

namespace Identity.Application.Restaurants.Queries.GetRestaurantDetails
{
    public record GetRestaurantDetailsQuery(Guid RestaurantId, Guid RequesterId) : IRequest<RestaurantDetailsDto>;
}