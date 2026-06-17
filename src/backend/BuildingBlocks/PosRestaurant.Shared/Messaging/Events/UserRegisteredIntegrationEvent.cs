using System;

namespace PosRestaurant.Shared.Messaging.Events;

public record UserRegisteredIntegrationEvent : IIntegrationEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime CreationDate { get; init; } = DateTime.UtcNow;
    
    public Guid UserId { get; init; }
    public string Email { get; init; }
    public string FirstName { get; init; }
    public string LastName { get; init; }
}