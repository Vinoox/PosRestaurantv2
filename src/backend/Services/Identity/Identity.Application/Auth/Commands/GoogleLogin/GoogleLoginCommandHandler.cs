using System;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Auth.Commands.Authenticate;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Identity.Application.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, AuthenticationResultDto>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IPublishEndpoint _publishEndpoint;

    public GoogleLoginCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IGoogleAuthService googleAuthService,
        IPublishEndpoint publishEndpoint)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _googleAuthService = googleAuthService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<AuthenticationResultDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var googleUser = await _googleAuthService.ValidateTokenAsync(request.IdToken);
        if (googleUser == null)
        {
            throw new BadRequestException("Nieprawidłowy lub nieważny token Google.");
        }

        var user = await _userManager.FindByEmailAsync(googleUser.Email);

        if (user == null)
        {
            user = User.Create(
                googleUser.FirstName ?? "Google",
                googleUser.LastName ?? "User",
                googleUser.Email
            );

            var result = await _userManager.CreateAsync(user, $"Ext_Auth!{Guid.NewGuid()}");

            if (!result.Succeeded)
            {
                throw new BadRequestException("Nie udało się utworzyć konta powiązanego z Google.");
            }

            await _publishEndpoint.Publish(new UserRegisteredIntegrationEvent
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }, cancellationToken);
        }

        var roles = await _userManager.GetRolesAsync(user);

        var token = _jwtTokenGenerator.GenerateAuthenticationToken(user, roles);

        return new AuthenticationResultDto
        {
            UserId = user.Id.ToString(),
            AuthenticationToken = token
        };
    }
}