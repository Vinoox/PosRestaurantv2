using System;

namespace Identity.Application.Restaurants.Queries.GetRestaurantDetails
{
    public class RestaurantDetailsDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Address { get; set; }
        public string? TaxId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}