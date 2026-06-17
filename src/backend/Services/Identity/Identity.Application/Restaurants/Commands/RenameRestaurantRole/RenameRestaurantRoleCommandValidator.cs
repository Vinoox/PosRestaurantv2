using FluentValidation;

namespace Identity.Application.Restaurants.Commands.RenameRestaurantRole
{
    public class RenameRestaurantRoleCommandValidator : AbstractValidator<RenameRestaurantRoleCommand>
    {
        public RenameRestaurantRoleCommandValidator()
        {
            RuleFor(x => x.NewName)
                .NotEmpty().WithMessage("Nazwa roli nie może być pusta.")
                .MaximumLength(50).WithMessage("Nazwa roli nie może przekraczać 50 znaków.")
                .NotEqual("Manager", System.StringComparer.OrdinalIgnoreCase)
                .WithMessage("Nazwa 'Manager' jest zastrzeżona.");
        }
    }
}