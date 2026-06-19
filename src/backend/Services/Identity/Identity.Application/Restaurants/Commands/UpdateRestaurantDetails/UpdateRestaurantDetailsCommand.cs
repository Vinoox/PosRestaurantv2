using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.UpdateRestaurantDetails;

public record UpdateRestaurantDetailsCommand(
    Guid RestaurantId,
    string Name,
    string? Address,
    string? TaxId,
    Guid RequesterId) : IRequest<Unit>;