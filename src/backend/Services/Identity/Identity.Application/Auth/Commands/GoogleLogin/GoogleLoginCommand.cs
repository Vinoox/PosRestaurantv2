using Identity.Application.Auth.Commands.Authenticate;
using MediatR;

namespace Identity.Application.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand(string IdToken) : IRequest<AuthenticationResultDto>;