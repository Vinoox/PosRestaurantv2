using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Restaurants.Commands.ChangeEmployeeRole
{
    public class ChangeEmployeeRoleCommandHandler : IRequestHandler<ChangeEmployeeRoleCommand, Unit>
    {
        private readonly IIdentityDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public ChangeEmployeeRoleCommandHandler(IIdentityDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<Unit> Handle(ChangeEmployeeRoleCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do zmiany ról pracowników.");

            var employee = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .FirstOrDefaultAsync(rm => rm.RestaurantId == request.RestaurantId && rm.UserId == request.EmployeeId, cancellationToken);

            if (employee == null)
                throw new NotFoundException("Pracownik", request.EmployeeId);

            var newRole = await _context.RestaurantRoles
                .FirstOrDefaultAsync(r => r.Id == request.NewRoleId && r.RestaurantId == request.RestaurantId, cancellationToken);

            if (newRole == null)
                throw new BadRequestException("Wybrana rola nie istnieje w tej restauracji.");

            if (employee.RestaurantRole.Name == "Manager" && newRole.Name != "Manager")
            {
                var managersCount = await _context.RestaurantMembers
                    .Include(rm => rm.RestaurantRole)
                    .CountAsync(rm => rm.RestaurantId == request.RestaurantId && rm.RestaurantRole.Name == "Manager", cancellationToken);

                if (managersCount <= 1)
                {
                    throw new BadRequestException("Nie można zmienić roli tego pracownika, ponieważ jest to ostatni Manager w tej restauracji.");
                }
            }

            employee.ChangeRole(request.NewRoleId);
            await _context.SaveChangesAsync(cancellationToken);

            await _publishEndpoint.Publish(new EmployeeRoleChangedIntegrationEvent
            {
                RestaurantId = request.RestaurantId,
                UserId = request.EmployeeId,
                NewRoleId = request.NewRoleId
            }, cancellationToken);

            return Unit.Value;
        }
    }
}