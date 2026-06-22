using FluentValidation;

namespace Ordering.Application.Orders.Commands.CreateDraftOrder;

public class CreateDraftOrderCommandValidator : AbstractValidator<CreateDraftOrderCommand>
{
    public CreateDraftOrderCommandValidator()
    {
        RuleFor(x => x.RestaurantId)
            .NotEmpty()
            .WithMessage("ID restauracji jest wymagane do otwarcia nowego rachunku.");
    }
}