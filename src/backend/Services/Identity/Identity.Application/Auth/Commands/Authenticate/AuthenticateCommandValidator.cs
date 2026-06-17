using FluentValidation;

namespace Identity.Application.Auth.Commands.Authenticate
{
    public class AuthenticateCommandValidator : AbstractValidator<AuthenticateCommand>
    {
        public AuthenticateCommandValidator()
        {
            RuleFor(command => command.Email)
                .NotEmpty().WithMessage("Email jest wymagany.")
                .EmailAddress().WithMessage("Niepoprawny format adresu email.");

            RuleFor(command => command.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane.");
        }
    }
}