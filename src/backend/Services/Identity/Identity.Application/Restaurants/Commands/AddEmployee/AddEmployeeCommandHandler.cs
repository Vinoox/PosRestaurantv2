using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Commands.AddEmployee
{
    public class AddEmployeeCommandHandler : IRequestHandler<AddEmployeeCommand, Unit>
    {
        private readonly IIdentityDbContext _context;
        private readonly UserManager<User> _userManager;

        public AddEmployeeCommandHandler(IIdentityDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<Unit> Handle(AddEmployeeCommand request, CancellationToken cancellationToken)
        {
            var isManager = await _context.RestaurantMembers
                .Include(rm => rm.RestaurantRole)
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId
                             && rm.UserId == request.RequesterId
                             && rm.RestaurantRole.Name == "Manager", cancellationToken);

            if (!isManager)
                throw new ForbiddenAccessException("Brak uprawnień do dodawania pracowników w tej restauracji.");

            var targetUser = await _userManager.FindByEmailAsync(request.EmployeeEmail);
            if (targetUser == null)
                throw new NotFoundException("Użytkownik z podanym adresem email nie istnieje w systemie.");

            var isAlreadyEmployed = await _context.RestaurantMembers
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId && rm.UserId == targetUser.Id, cancellationToken);

            if (isAlreadyEmployed)
                throw new BadRequestException("Ten użytkownik jest już pracownikiem tej restauracji.");

            var targetRole = await _context.RestaurantRoles
                .FirstOrDefaultAsync(rr => rr.Id == request.RoleId && rr.RestaurantId == request.RestaurantId, cancellationToken);

            if (targetRole == null)
                throw new BadRequestException("Wybrana rola nie istnieje w tej restauracji.");

            var newMember = RestaurantMember.Create(targetUser.Id, request.RestaurantId, targetRole);
            _context.RestaurantMembers.Add(newMember);

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}