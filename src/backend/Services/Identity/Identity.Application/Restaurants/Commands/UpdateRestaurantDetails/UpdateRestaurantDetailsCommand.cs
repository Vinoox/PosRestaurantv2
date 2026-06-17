using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.UpdateRestaurantDetails
{
    public class UpdateRestaurantDetailsCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }

        public required string Name { get; set; }
        public string? Address { get; set; }
        public string? TaxId { get; set; }
    }
}