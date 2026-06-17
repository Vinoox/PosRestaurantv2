using FluentValidation;

namespace Identity.Application.Auth.Commands.SelectRestaurant
{
    public class SelectRestaurantCommandValidator : AbstractValidator<SelectRestaurantCommand>
    {
        public SelectRestaurantCommandValidator()
        {
            RuleFor(command => command.RestaurantId)
                .NotEmpty().WithMessage("Id restauracji jest wymagane.")
                .GreaterThan(0).WithMessage("Niepoprawne Id restauracji.");
        }
    }
}