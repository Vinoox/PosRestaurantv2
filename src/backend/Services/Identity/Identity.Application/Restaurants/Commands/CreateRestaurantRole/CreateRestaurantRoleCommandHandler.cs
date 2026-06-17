using System;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Commands.CreateRestaurantRole
{
    public class CreateRestaurantRoleCommandHandler : IRequestHandler<CreateRestaurantRoleCommand, Guid>
    {
        private readonly IIdentityDbContext _context;

        public CreateRestaurantRoleCommandHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateRestaurantRoleCommand request, CancellationToken cancellationToken)
        {
            var hasAccess = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm =>
                    rm.RestaurantId == request.RestaurantId &&
                    rm.UserId == request.RequesterId &&
                    rm.RestaurantRole.Name == "Manager",
                    cancellationToken);

            if (!hasAccess)
            {
                throw new ForbiddenAccessException("Nie masz uprawnień menedżera, aby zarządzać rolami w tej restauracji.");
            }

            var roleExists = await _context.RestaurantRoles
                .AnyAsync(rr => rr.RestaurantId == request.RestaurantId && rr.Name == request.Name, cancellationToken);

            if (roleExists)
            {
                throw new BadRequestException($"Rola o nazwie '{request.Name}' już istnieje w tej restauracji.");
            }

            var newRole = RestaurantRole.Create(request.Name, request.RestaurantId);

            _context.RestaurantRoles.Add(newRole);
            await _context.SaveChangesAsync(cancellationToken);

            return newRole.Id;
        }
    }
}