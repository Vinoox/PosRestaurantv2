using FluentValidation;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.RestaurantId)
            .NotEmpty()
            .WithMessage("ID restauracji jest wymagane do otwarcia zamówienia.");

        When(x => !string.IsNullOrWhiteSpace(x.TableNumber), () =>
        {
            RuleFor(x => x.TableNumber)
                .MaximumLength(50)
                .WithMessage("Podany numer stolika jest zbyt długi.");
        });
    }
}