using FluentValidation;

namespace Ordering.Application.Orders.Commands.AddOrderItem;
public class AddOrderItemCommandValidator : AbstractValidator<AddOrderItemCommand>
{
    public AddOrderItemCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty().WithMessage("ID zamówienia jest wymagane.");
        RuleFor(x => x.RestaurantId).NotEmpty().WithMessage("ID restauracji jest wymagane.");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ID dodawanego produktu jest wymagane.");
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Ilość dodawanego produktu musi być większa niż 0.");
        RuleFor(x => x.AccessToken).NotEmpty().WithMessage("Brak tokenu autoryzacyjnego do odpytania menu.");
    }
}