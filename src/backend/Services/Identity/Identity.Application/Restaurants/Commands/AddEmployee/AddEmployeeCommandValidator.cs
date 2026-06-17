using FluentValidation;

namespace Identity.Application.Restaurants.Commands.AddEmployee
{
    public class AddEmployeeCommandValidator : AbstractValidator<AddEmployeeCommand>
    {
        public AddEmployeeCommandValidator()
        {
            RuleFor(x => x.EmployeeEmail)
                .NotEmpty().WithMessage("Email pracownika jest wymagany.")
                .EmailAddress().WithMessage("Podano niepoprawny format adresu email.");

            RuleFor(x => x.RoleId)
                .NotEmpty().WithMessage("Identyfikator roli jest wymagany.");
        }
    }
}