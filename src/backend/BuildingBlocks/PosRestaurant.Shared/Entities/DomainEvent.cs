using System;

namespace PosRestaurant.Shared.Entities;

public abstract record DomainEvent
{
    public DateTime OccurredOn { get; protected set; } = DateTime.UtcNow;
}