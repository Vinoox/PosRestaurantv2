using System;

namespace PosRestaurant.Shared.Messaging.Events
{
    public class EmployeeRemovedIntegrationEvent
    {
        public Guid RestaurantId { get; set; }
        public Guid UserId { get; set; }
    }
}