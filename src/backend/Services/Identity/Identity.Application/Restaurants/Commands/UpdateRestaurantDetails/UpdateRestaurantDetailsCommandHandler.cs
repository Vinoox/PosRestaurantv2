using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Restaurants.Commands.UpdateRestaurantDetails
{
    public class UpdateRestaurantDetailsCommandHandler : IRequestHandler<UpdateRestaurantDetailsCommand, Unit>
    {
        private readonly IIdentityDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public UpdateRestaurantDetailsCommandHandler(IIdentityDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<Unit> Handle(UpdateRestaurantDetailsCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do edycji danych tej restauracji.");

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken);

            if (restaurant == null)
                throw new NotFoundException("Restauracja", request.RestaurantId);

            var nameExists = await _context.Restaurants
                .AnyAsync(r => r.Name == request.Name && r.Id != request.RestaurantId, cancellationToken);

            if (nameExists)
                throw new BadRequestException("Podana nazwa restauracji jest już zajęta.");

            restaurant.UpdateDetails(request.Name, request.Address, request.TaxId);

            await _context.SaveChangesAsync(cancellationToken);

            await _publishEndpoint.Publish(new RestaurantUpdatedIntegrationEvent
            {
                RestaurantId = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                TaxId = restaurant.TaxId
            }, cancellationToken);

            return Unit.Value;
        }
    }
}