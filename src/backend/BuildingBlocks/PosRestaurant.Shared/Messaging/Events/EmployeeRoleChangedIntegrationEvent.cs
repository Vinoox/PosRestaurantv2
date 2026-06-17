using System;

namespace PosRestaurant.Shared.Messaging.Events
{
    public class EmployeeRoleChangedIntegrationEvent
    {
        public Guid RestaurantId { get; set; }
        public Guid UserId { get; set; }
        public Guid NewRoleId { get; set; }
    }
}