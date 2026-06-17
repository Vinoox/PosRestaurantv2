using FluentValidation;

namespace Identity.Application.Users.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
    {
        public UpdateUserProfileCommandValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Imię nie może być puste.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Nazwisko nie może być puste.");
        }
    }
}