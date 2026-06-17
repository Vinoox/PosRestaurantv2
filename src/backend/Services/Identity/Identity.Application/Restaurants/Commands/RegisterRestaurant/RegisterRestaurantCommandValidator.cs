using FluentValidation;

namespace Identity.Application.Restaurants.Commands.RegisterRestaurant
{
    public class RegisterRestaurantCommandValidator : AbstractValidator<RegisterRestaurantCommand>
    {
        public RegisterRestaurantCommandValidator()
        {
            RuleFor(command => command.Name)
                .NotEmpty().WithMessage("Nazwa restauracji jest wymagana.")
                .MaximumLength(100).WithMessage("Nazwa restauracji nie może przekraczać 100 znaków.");

            RuleFor(command => command.TaxId)
                .MaximumLength(20).WithMessage("NIP (TaxId) nie może przekraczać 20 znaków.");

            RuleFor(command => command.OwnerId)
                .NotEmpty().WithMessage("Identyfikator właściciela (OwnerId) jest wymagany.");
        }
    }
}