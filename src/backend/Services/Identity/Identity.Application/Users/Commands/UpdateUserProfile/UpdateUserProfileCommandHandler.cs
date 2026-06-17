using System.Threading;
using System.Threading.Tasks;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Users.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Unit>
    {
        private readonly UserManager<User> _userManager;

        public UpdateUserProfileCommandHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Unit> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString())
                ?? throw new NotFoundException("Użytkownik", request.UserId);

            user.UpdateFirstName(request.FirstName);
            user.UpdateLastName(request.LastName);

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                throw new BadRequestException("Wystąpił błąd podczas aktualizacji profilu.");
            }

            return Unit.Value;
        }
    }
}