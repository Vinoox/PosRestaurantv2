using System;

namespace Identity.Application.Restaurants.Queries.GetUserRestaurants
{
    public class RestaurantDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string UserRole { get; set; }
    }
}