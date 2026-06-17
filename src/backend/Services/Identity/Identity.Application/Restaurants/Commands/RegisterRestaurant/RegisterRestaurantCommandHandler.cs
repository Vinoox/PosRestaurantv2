using System;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Restaurants.Commands.RegisterRestaurant
{
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
            if (await _context.Restaurants.AnyAsync(r => r.Name == request.Name, cancellationToken))
            {
                throw new BadRequestException("Restauracja o podanej nazwie już istnieje.");
            }

            var restaurant = Restaurant.Create(request.Name, request.Address, request.TaxId);

            _context.Restaurants.Add(restaurant);

            var managerRole = RestaurantRole.Create("Manager", restaurant.Id, isSystemRole: true);
            _context.RestaurantRoles.Add(managerRole);

            var ownership = RestaurantMember.Create(request.OwnerId, restaurant.Id, managerRole);
            _context.RestaurantMembers.Add(ownership);

            await _context.SaveChangesAsync(cancellationToken);

            var integrationEvent = new RestaurantRegisteredIntegrationEvent
            {
                RestaurantId = restaurant.Id,
                Name = restaurant.Name,
                OwnerId = request.OwnerId
            };

            await _publishEndpoint.Publish(integrationEvent, cancellationToken);

            return restaurant.Id;
        }
    }
}