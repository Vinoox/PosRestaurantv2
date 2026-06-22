using System;
using PosRestaurant.Shared.Entities;

namespace Ordering.Domain.Entities.Fulfillments;

public abstract class Fulfillment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}