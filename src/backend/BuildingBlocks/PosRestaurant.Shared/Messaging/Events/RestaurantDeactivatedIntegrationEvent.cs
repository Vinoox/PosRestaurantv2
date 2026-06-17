using System;

namespace PosRestaurant.Shared.Messaging.Events
{
    public class RestaurantDeactivatedIntegrationEvent
    {
        public Guid RestaurantId { get; set; }
        public Guid DeactivatedBy { get; set; }
    }
}