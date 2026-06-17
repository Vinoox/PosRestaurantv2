using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MassTransit;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;
using Identity.Application.Restaurants.Dtos;

namespace Identity.Application.Restaurants.Commands;
public record RegisterRestaurantCommand(RegisterRestaurantDto Dto) : IRequest<Guid>;

public class RegisterRestaurantCommandHandler : IRequestHandler<RegisterRestaurantCommand, Guid>
{
    private readonly IIdentityDbContext _context;
    private readonly IPublishEndpoint _publishEndpoint;

    public RegisterRestaurantCommandHandler(IIdentityDbContext context, IPublishEndpoint publishEndpoint)
    {
        _context = context;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(RegisterRestaurantCommand request, CancellationToken cancellationToken)
    {
        if (_context.Restaurants.Any(r => r.Name == request.Dto.Name))
        {
            throw new BadRequestException("Restaurant with this name already exists.");
        }

        var restaurant = Restaurant.Create(request.Dto.Name);

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync(cancellationToken);

        var integrationEvent = new RestaurantRegisteredIntegrationEvent
        {
            RestaurantId = restaurant.Id,
            Name = restaurant.Name,
            OwnerId = request.Dto.OwnerId
        };

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        return restaurant.Id;
    }
}