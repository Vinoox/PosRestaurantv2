using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Queries.GetRestaurantRoles
{
    public class GetRestaurantRolesQueryHandler : IRequestHandler<GetRestaurantRolesQuery, List<RestaurantRoleDto>>
    {
        private readonly IIdentityDbContext _context;

        public GetRestaurantRolesQueryHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<List<RestaurantRoleDto>> Handle(GetRestaurantRolesQuery request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do przeglądania ról w tej restauracji.");

            return await _context.RestaurantRoles
                .AsNoTracking()
                .Where(r => r.RestaurantId == request.RestaurantId)
                .Select(r => new RestaurantRoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    IsSystemRole = r.IsSystemRole
                })
                .ToListAsync(cancellationToken);
        }
    }
}