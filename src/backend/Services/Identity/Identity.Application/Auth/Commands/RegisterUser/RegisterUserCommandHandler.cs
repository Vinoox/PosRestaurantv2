using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using MassTransit;
using Identity.Domain.Entities;
using Identity.Domain.Constants;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Auth.Commands.RegisterUser
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IValidator<RegisterUserCommand> _validator;
        private readonly IPublishEndpoint _publishEndpoint;

        public RegisterUserCommandHandler(
            UserManager<User> userManager,
            IValidator<RegisterUserCommand> validator,
            IPublishEndpoint publishEndpoint)
        {
            _userManager = userManager;
            _validator = validator;
            _publishEndpoint = publishEndpoint;
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

            var roleToAssign = GlobalRoles.GetAll()
                .FirstOrDefault(r => string.Equals(r, request.Role, StringComparison.OrdinalIgnoreCase))
                ?? GlobalRoles.Default;

            await _userManager.AddToRoleAsync(user, roleToAssign);

            var integrationEvent = new UserRegisteredIntegrationEvent
            {
                UserId = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            await _publishEndpoint.Publish(integrationEvent, cancellationToken);

            return Unit.Value;
        }
    }
}