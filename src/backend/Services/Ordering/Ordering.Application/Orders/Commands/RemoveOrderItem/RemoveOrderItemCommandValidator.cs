using FluentValidation;

namespace Ordering.Application.Orders.Commands.RemoveOrderItem;

public class RemoveOrderItemCommandValidator : AbstractValidator<RemoveOrderItemCommand>
{
    public RemoveOrderItemCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty().WithMessage("ID zamówienia jest wymagane.");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ID usuwanego produktu jest wymagane.");
        RuleFor(x => x.RestaurantId).NotEmpty().WithMessage("ID restauracji jest wymagane.");
    }
}