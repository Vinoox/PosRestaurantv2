using FluentValidation;

namespace Ordering.Application.Orders.Commands.CompleteOrder;

public class CompleteOrderCommandValidator : AbstractValidator<CompleteOrderCommand>
{
    public CompleteOrderCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty()
            .WithMessage("ID zamówienia do zrealizowania nie może być puste.");

        RuleFor(x => x.RestaurantId)
            .NotEmpty()
            .WithMessage("ID restauracji jest wymagane.");
    }
}