using System;

namespace PosRestaurant.Shared.Messaging.Events
{
    public class RestaurantUpdatedIntegrationEvent
    {
        public Guid RestaurantId { get; set; }
        public required string Name { get; set; }
        public string? Address { get; set; }
        public string? TaxId { get; set; }
    }
}