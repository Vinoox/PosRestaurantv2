using FluentValidation;

namespace Identity.Application.Restaurants.Commands.UpdateRestaurantDetails
{
    public class UpdateRestaurantDetailsCommandValidator : AbstractValidator<UpdateRestaurantDetailsCommand>
    {
        public UpdateRestaurantDetailsCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nazwa restauracji jest wymagana.")
                .MaximumLength(100).WithMessage("Nazwa nie może przekraczać 100 znaków.");

            RuleFor(x => x.TaxId)
                .MaximumLength(20).WithMessage("NIP jest zbyt długi.");
        }
    }
}