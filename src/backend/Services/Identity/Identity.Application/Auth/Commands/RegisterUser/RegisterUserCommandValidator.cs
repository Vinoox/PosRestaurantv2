using FluentValidation;
using Identity.Domain.Constants;

namespace Identity.Application.Auth.Commands.RegisterUser
{
    public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidator()
        {
            RuleFor(command => command.FirstName)
                .NotEmpty().WithMessage("Imię jest wymagane.");

            RuleFor(command => command.LastName)
                .NotEmpty().WithMessage("Nazwisko jest wymagane.");

            RuleFor(command => command.Email)
                .NotEmpty().WithMessage("Email jest wymagany.")
                .EmailAddress().WithMessage("Podano niepoprawny format adresu email.");

            RuleFor(command => command.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane.")
                .MinimumLength(8).WithMessage("Hasło musi mieć co najmniej 8 znaków.")
                .Matches("[A-Z]").WithMessage("Hasło musi zawierać przynajmniej jedną wielką literę.")
                .Matches("[a-z]").WithMessage("Hasło musi zawierać przynajmniej jedną małą literę.")
                .Matches("[0-9]").WithMessage("Hasło musi zawierać przynajmniej jedną cyfrę.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Hasło musi zawierać przynajmniej jeden znak specjalny.");

            RuleFor(command => command.ConfirmPassword)
                .NotEmpty().WithMessage("Potwierdzenie hasła jest wymagane.")
                .Equal(command => command.Password).WithMessage("Podane hasła muszą być takie same.");

            RuleFor(x => x.Role)
                .Must(role => GlobalRoles.GetAll().Contains(role, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"Podana rola jest nieprawidłowa. Dostępne role to: {string.Join(", ", GlobalRoles.GetAll())}");
        }
    }
}