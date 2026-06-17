using FluentValidation;
using Identity.Application.Auth.Commands.RegisterUser;

namespace Identity.Application.Auth.Validators
{
    public class RegisterUserDtoValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserDtoValidator()
        {

            RuleFor(dto => dto.FirstName)
                .NotEmpty().WithMessage("Imię jest wymagane.");

            RuleFor(dto => dto.LastName)
                .NotEmpty().WithMessage("Nazwisko jest wymagane.");

            RuleFor(dto => dto.Email)
                .NotEmpty().WithMessage("Email jest wymagany.")
                .EmailAddress().WithMessage("Podano niepoprawny format adresu email.");

            RuleFor(dto => dto.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane.")
                .MinimumLength(8).WithMessage("Hasło musi mieć co najmniej 8 znaków.")
                .Matches("[A-Z]").WithMessage("Hasło musi zawierać przynajmniej jedną wielką literę.")
                .Matches("[a-z]").WithMessage("Hasło musi zawierać przynajmniej jedną małą literę.")
                .Matches("[0-9]").WithMessage("Hasło musi zawierać przynajmniej jedną cyfrę.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Hasło musi zawierać przynajmniej jeden znak specjalny.");

            RuleFor(dto => dto.ConfirmPassword)
                .NotEmpty().WithMessage("Potwierdzenie hasła jest wymagane.")
                .Equal(dto => dto.Password).WithMessage("Podane hasła muszą być takie same.");

            RuleFor(dto => dto.Pin)
                .NotEmpty().WithMessage("PIN jest wymagany.")
                .Length(4).WithMessage("PIN musi składać się z dokładnie 4 cyfr.")
                .Matches("^[0-9]{4}$").WithMessage("PIN może zawierać tylko cyfry.");
        }
    }
}