using Identity.Application.Common.Extensions;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System.Threading.Tasks;

namespace Identity.Application.Auth.Commands.Authenticate;

public class AuthenticateCommandHandler : IRequestHandler<AuthenticateCommand, AuthenticationResultDto>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthenticateCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResultDto> Handle(AuthenticateCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailOrThrowAsync(request.Email);

        var globalRoles = await _userManager.GetRolesAsync(user);

        var authToken = _jwtTokenGenerator.GenerateAuthenticationToken(user, globalRoles);

        return new AuthenticationResultDto
        {
            UserId = user.Id.ToString(),
            AuthenticationToken = authToken
        };
    }
}