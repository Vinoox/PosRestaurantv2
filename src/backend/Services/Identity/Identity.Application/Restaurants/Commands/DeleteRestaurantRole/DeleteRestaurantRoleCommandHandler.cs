using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Commands.DeleteRestaurantRole
{
    public class DeleteRestaurantRoleCommandHandler : IRequestHandler<DeleteRestaurantRoleCommand, Unit>
    {
        private readonly IIdentityDbContext _context;

        public DeleteRestaurantRoleCommandHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteRestaurantRoleCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do usuwania ról.");

            var role = await _context.RestaurantRoles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId && r.RestaurantId == request.RestaurantId, cancellationToken);

            if (role == null)
                throw new NotFoundException("Rola", request.RoleId);

            if (role.IsSystemRole)
                throw new BadRequestException("Nie można usunąć systemowej roli.");

            var isRoleInUse = await _context.RestaurantMembers
                .AnyAsync(rm => rm.RestaurantRoleId == request.RoleId, cancellationToken);

            if (isRoleInUse)
                throw new BadRequestException("Nie można usunąć roli, ponieważ są do niej przypisani pracownicy.");

            _context.RestaurantRoles.Remove(role);

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}