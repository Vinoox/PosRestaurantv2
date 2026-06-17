using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Auth.Commands.Authenticate
{
    public class AuthenticateCommandHandler : IRequestHandler<AuthenticateCommand, string>
    {
        private readonly UserManager<User> _userManager;
        private readonly IValidator<AuthenticateCommand> _validator;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthenticateCommandHandler(
            UserManager<User> userManager,
            IValidator<AuthenticateCommand> validator,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _validator = validator;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<string> Handle(AuthenticateCommand request, CancellationToken cancellationToken)
        {
            await _validator.ValidateAndThrowAsync(request, cancellationToken);

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new BadRequestException("Nieprawidłowy email lub hasło.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                throw new BadRequestException("Nieprawidłowy email lub hasło.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var token = _jwtTokenGenerator.GenerateToken(user, roles);

            return token;
        }
    }
}