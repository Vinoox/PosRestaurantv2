using FluentValidation;

namespace Identity.Application.Users.Commands.ChangePassword
{
    public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandValidator()
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