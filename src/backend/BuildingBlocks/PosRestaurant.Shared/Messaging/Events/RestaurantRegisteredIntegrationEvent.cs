using System;

namespace PosRestaurant.Shared.Messaging.Events;

public record RestaurantRegisteredIntegrationEvent : IIntegrationEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime CreationDate { get; init; } = DateTime.UtcNow;
    
    public Guid RestaurantId { get; init; }
    public string Name { get; init; }
    public Guid OwnerId { get; init; }
}