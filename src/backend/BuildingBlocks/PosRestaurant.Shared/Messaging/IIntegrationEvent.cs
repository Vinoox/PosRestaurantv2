using System;

namespace PosRestaurant.Shared.Messaging;

public interface IIntegrationEvent
{
    Guid Id { get; }
    DateTime CreationDate { get; }
}