using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Restaurants.Commands.DeactivateRestaurant
{
    public class DeactivateRestaurantCommandHandler : IRequestHandler<DeactivateRestaurantCommand, Unit>
    {
        private readonly IIdentityDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public DeactivateRestaurantCommandHandler(IIdentityDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<Unit> Handle(DeactivateRestaurantCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do usunięcia tej restauracji.");

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken);

            if (restaurant == null)
                throw new NotFoundException("Restauracja", request.RestaurantId);

            if (!restaurant.IsActive)
                throw new BadRequestException("Ta restauracja jest już nieaktywna.");

            restaurant.Deactivate();

            await _context.SaveChangesAsync(cancellationToken);

            await _publishEndpoint.Publish(new RestaurantDeactivatedIntegrationEvent
            {
                RestaurantId = restaurant.Id,
                DeactivatedBy = request.RequesterId
            }, cancellationToken);

            return Unit.Value;
        }
    }
}