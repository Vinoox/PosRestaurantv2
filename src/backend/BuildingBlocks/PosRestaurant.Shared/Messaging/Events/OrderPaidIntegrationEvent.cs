using System;

namespace PosRestaurant.Shared.Messaging.Events;

public record OrderPaidIntegrationEvent(
    Guid OrderId,
    Guid RestaurantId,
    decimal TotalAmount,
    DateTime PaidAt
);