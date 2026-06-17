using FluentValidation;
using Identity.Application.Restaurants.Commands.RegisterRestaurant;

namespace Identity.Application.Restaurants.Validators
{
    public class RegisterRestaurantCommandValidator : AbstractValidator<RegisterRestaurantCommand>
    {
        public RegisterRestaurantCommandValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty().WithMessage("Nazwa restauracji jest wymagana")
                .MaximumLength(100);

            RuleFor(x => x.Dto.TaxId)
                .MaximumLength(20);
        }
    }
}