using MediatR;

namespace Identity.Application.Auth.Commands.Authenticate
{
    public class AuthenticateCommand : IRequest<string>
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}