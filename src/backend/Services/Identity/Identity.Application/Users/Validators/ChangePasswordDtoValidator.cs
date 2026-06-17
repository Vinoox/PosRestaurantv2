using FluentValidation;
using Identity.Application.Users.Commands.ChangePassword;

namespace Identity.Application.Users.Validators
{
    public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordDtoValidator()
        {
            RuleFor(x => x.OldPassword)
                .NotEmpty().WithMessage("Stare hasło jest wymagane.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Nowe hasło jest wymagane.")
                .MinimumLength(8).WithMessage("Nowe hasło musi mieć co najmniej 8 znaków.");

            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty().WithMessage("Potwierdzenie hasła jest wymagane.")
                .Equal(x => x.NewPassword).WithMessage("Podane hasła muszą być takie same.");
        }
    }
}