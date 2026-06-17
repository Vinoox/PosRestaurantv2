using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.DeactivateRestaurant
{
    public class DeactivateRestaurantCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }
    }
}