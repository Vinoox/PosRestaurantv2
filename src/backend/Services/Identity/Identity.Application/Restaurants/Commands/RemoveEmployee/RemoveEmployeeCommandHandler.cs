using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Restaurants.Commands.RemoveEmployee
{
    public class RemoveEmployeeCommandHandler : IRequestHandler<RemoveEmployeeCommand, Unit>
    {
        private readonly IIdentityDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public RemoveEmployeeCommandHandler(IIdentityDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<Unit> Handle(RemoveEmployeeCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do zwalniania pracowników.");

            var employee = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .FirstOrDefaultAsync(rm => rm.RestaurantId == request.RestaurantId && rm.UserId == request.EmployeeId, cancellationToken);

            if (employee == null)
                throw new NotFoundException("Pracownik", request.EmployeeId);

            if (employee.RestaurantRole.Name == "Manager")
            {
                var managersCount = await _context.RestaurantMembers
                    .Include(rm => rm.RestaurantRole)
                    .CountAsync(rm => rm.RestaurantId == request.RestaurantId && rm.RestaurantRole.Name == "Manager", cancellationToken);

                if (managersCount <= 1)
                {
                    throw new BadRequestException("Nie można usunąć tego pracownika, ponieważ jest to ostatni Manager w tej restauracji.");
                }
            }

            _context.RestaurantMembers.Remove(employee);
            await _context.SaveChangesAsync(cancellationToken);

            await _publishEndpoint.Publish(new EmployeeRemovedIntegrationEvent
            {
                RestaurantId = request.RestaurantId,
                UserId = request.EmployeeId
            }, cancellationToken);

            return Unit.Value;
        }
    }
}