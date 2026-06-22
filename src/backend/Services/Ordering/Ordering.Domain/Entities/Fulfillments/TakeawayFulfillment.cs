using System;

namespace Ordering.Domain.Entities.Fulfillments;

public class TakeawayFulfillment : Fulfillment
{
    public string? CustomerName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? PickupTime { get; set; }
}