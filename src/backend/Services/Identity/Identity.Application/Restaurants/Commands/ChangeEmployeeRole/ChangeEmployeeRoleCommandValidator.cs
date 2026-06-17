using FluentValidation;

namespace Identity.Application.Restaurants.Commands.ChangeEmployeeRole
{
    public class ChangeEmployeeRoleCommandValidator : AbstractValidator<ChangeEmployeeRoleCommand>
    {
        public ChangeEmployeeRoleCommandValidator()
        {
            RuleFor(x => x.NewRoleId)
                .NotEmpty().WithMessage("Należy podać identyfikator nowej roli.");
        }
    }
}