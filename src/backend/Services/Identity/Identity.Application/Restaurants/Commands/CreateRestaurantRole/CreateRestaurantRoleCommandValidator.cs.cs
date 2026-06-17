using FluentValidation;

namespace Identity.Application.Restaurants.Commands.CreateRestaurantRole
{
    public class CreateRestaurantRoleCommandValidator : AbstractValidator<CreateRestaurantRoleCommand>
    {
        public CreateRestaurantRoleCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nazwa roli nie może być pusta.")
                .MaximumLength(50).WithMessage("Nazwa roli nie może przekraczać 50 znaków.")
                .NotEqual("Manager", System.StringComparer.OrdinalIgnoreCase)
                .WithMessage("Nazwa 'Manager' jest zarezerwowana dla ról systemowych.");
        }
    }
}