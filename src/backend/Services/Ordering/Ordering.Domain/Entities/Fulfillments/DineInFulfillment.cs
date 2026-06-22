using System;

namespace Ordering.Domain.Entities.Fulfillments;

public class DineInFulfillment : Fulfillment
{
    public Guid TableId { get; set; }
    public Table Table { get; set; } = null!;
}