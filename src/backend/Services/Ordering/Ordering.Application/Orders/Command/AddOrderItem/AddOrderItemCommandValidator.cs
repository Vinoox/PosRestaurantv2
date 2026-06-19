using FluentValidation;

namespace Ordering.Application.Orders.Commands.AddOrderItem;

public class AddOrderItemCommandValidator : AbstractValidator<AddOrderItemCommand>
{
    public AddOrderItemCommandValidator()
    {
        RuleFor(v => v.OrderId).NotEmpty();
        RuleFor(v => v.RestaurantId).NotEmpty();
        RuleFor(v => v.ProductId).NotEmpty();
        RuleFor(v => v.Quantity)
            .GreaterThan(0).WithMessage("Ilość musi być większa niż zero.");
        RuleFor(v => v.AccessToken).NotEmpty();
    }
}