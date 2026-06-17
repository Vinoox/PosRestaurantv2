using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.RegisterRestaurant
{
    public record RegisterRestaurantCommand(
        string Name,
        string? Address,
        string? TaxId,
        Guid OwnerId) : IRequest<Guid>;
}