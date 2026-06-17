using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Commands.RenameRestaurantRole
{
    public class RenameRestaurantRoleCommandHandler : IRequestHandler<RenameRestaurantRoleCommand, Unit>
    {
        private readonly IIdentityDbContext _context;

        public RenameRestaurantRoleCommandHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(RenameRestaurantRoleCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do edycji ról.");

            var role = await _context.RestaurantRoles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId && r.RestaurantId == request.RestaurantId, cancellationToken);

            if (role == null)
                throw new NotFoundException("Rola", request.RoleId);

            var nameExists = await _context.RestaurantRoles
                .AnyAsync(r => r.RestaurantId == request.RestaurantId && r.Name == request.NewName, cancellationToken);

            if (nameExists)
                throw new BadRequestException($"Rola o nazwie '{request.NewName}' już istnieje.");

            role.UpdateName(request.NewName);

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}