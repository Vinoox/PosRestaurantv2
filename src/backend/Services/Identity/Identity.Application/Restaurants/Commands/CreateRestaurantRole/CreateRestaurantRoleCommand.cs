using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.CreateRestaurantRole
{
    public class CreateRestaurantRoleCommand : IRequest<Guid>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }

        public required string Name { get; set; }
    }
}