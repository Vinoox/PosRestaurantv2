using Identity.Application.Auth.Queries;
using MediatR;

namespace Identity.Application.Auth.Commands.Authenticate;

public record AuthenticateCommand(string Email, string Password) : IRequest<AuthenticationResultDto>;