using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Identity.Domain.Entities;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Auth.Commands.RegisterUser
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IValidator<RegisterUserCommand> _validator;

        public RegisterUserCommandHandler(UserManager<User> userManager, IValidator<RegisterUserCommand> validator)
        {
            _userManager = userManager;
            _validator = validator;
        }

        public async Task<Unit> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            await _validator.ValidateAndThrowAsync(request, cancellationToken);

            var user = User.Create(request.FirstName, request.LastName, request.Email);

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                if (result.Errors.Any(e => e.Code == "DuplicateEmail"))
                    throw new BadRequestException("Użytkownik o podanym adresie email już istnieje");

                throw new BadRequestException("Błąd rejestracji: " + string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, "Default");
            return Unit.Value;
        }
    }
}