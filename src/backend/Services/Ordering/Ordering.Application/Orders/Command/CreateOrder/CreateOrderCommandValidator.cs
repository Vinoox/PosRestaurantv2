using FluentValidation;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(v => v.RestaurantId)
            .NotEmpty().WithMessage("ID restauracji jest wymagane.");

        RuleFor(v => v.TableNumber)
            .MaximumLength(50).WithMessage("Numer stolika nie może przekraczać 50 znaków.");
    }
}