using System.Linq;
using FluentValidation;

namespace Ordering.Application.Orders.Commands.AssignFulfillment;

public class AssignFulfillmentCommandValidator : AbstractValidator<AssignFulfillmentCommand>
{
    public AssignFulfillmentCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty().WithMessage("ID zamówienia jest wymagane.");
        RuleFor(x => x.RestaurantId).NotEmpty().WithMessage("ID restauracji jest wymagane.");
        RuleFor(x => x.FulfillmentData).NotNull().WithMessage("Paczka danych realizacji nie może być pusta.");

        When(x => x.FulfillmentData != null, () =>
        {
            RuleFor(x => x.FulfillmentData.FulfillmentType)
                .NotEmpty()
                .Must(t => new[] { "DINE_IN", "TAKEAWAY", "OWN_DELIVERY", "AGGREGATOR" }.Contains(t?.ToUpper()))
                .WithMessage("Wskazano nieznany kanał realizacji zamówienia.");

            When(x => x.FulfillmentData.FulfillmentType?.ToUpper() == "OWN_DELIVERY", () =>
            {
                RuleFor(x => x.FulfillmentData.Street).NotEmpty().WithMessage("Nazwa ulicy dla dostawy jest wymagana.");
                RuleFor(x => x.FulfillmentData.BuildingNumber).NotEmpty().WithMessage("Numer budynku jest wymagany.");
            });

            When(x => x.FulfillmentData.FulfillmentType?.ToUpper() == "AGGREGATOR", () =>
            {
                RuleFor(x => x.FulfillmentData.PickupCode).NotEmpty().WithMessage("Kod odbioru z tableta Uber/Glovo jest wymagany.");
            });
        });
    }
}