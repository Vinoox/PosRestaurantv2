using System;

namespace Identity.Application.Restaurants.Queries.GetRestaurantRoles
{
    public class RestaurantRoleDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public bool IsSystemRole { get; set; }
    }
}