using FluentValidation;

namespace Identity.Application.Auth.Commands.SelectRestaurant
{
    public class SelectRestaurantCommandValidator : AbstractValidator<SelectRestaurantCommand>
    {
        public SelectRestaurantCommandValidator()
        {
            RuleFor(x => x.RestaurantId)
            .NotEmpty().WithMessage("Identyfikator restauracji jest wymagany i nie może być pusty.");
        }
    }
}