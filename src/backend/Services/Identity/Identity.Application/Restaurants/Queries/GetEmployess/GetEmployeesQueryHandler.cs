using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Queries.GetEmployees
{
    public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, List<EmployeeDto>>
    {
        private readonly IIdentityDbContext _context;

        public GetEmployeesQueryHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do przeglądania personelu.");

            var employees = await _context.RestaurantMembers
                .Where(rm => rm.RestaurantId == request.RestaurantId)
                .Include(rm => rm.RestaurantRole)
                .Join(_context.Users,
                      member => member.UserId,
                      user => user.Id,
                      (member, user) => new EmployeeDto
                      {
                          UserId = user.Id,
                          FirstName = user.FirstName,
                          LastName = user.LastName,
                          Email = user.Email!,
                          RoleId = member.RestaurantRoleId,
                          RoleName = member.RestaurantRole.Name
                      })
                .ToListAsync(cancellationToken);

            return employees;
        }
    }
}