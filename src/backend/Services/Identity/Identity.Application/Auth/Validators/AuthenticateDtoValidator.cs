using FluentValidation;
using Identity.Application.Auth.Commands.Authenticate;

namespace Identity.Application.Auth.Validators
{
    public class AuthenticateDtoValidator : AbstractValidator<AuthenticateCommand>
    {
        public AuthenticateDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email jest wymagany.")
                .EmailAddress().WithMessage("Niepoprawny format adresu email.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane.");
        }
    }
}