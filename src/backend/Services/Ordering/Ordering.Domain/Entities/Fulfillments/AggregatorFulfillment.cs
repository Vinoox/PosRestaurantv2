namespace Ordering.Domain.Entities.Fulfillments;

public class AggregatorFulfillment : Fulfillment
{
    public required string ProviderName { get; set; }
    public required string PickupCode { get; set; }
    public decimal DeclaredExternalTotal { get; set; }
}