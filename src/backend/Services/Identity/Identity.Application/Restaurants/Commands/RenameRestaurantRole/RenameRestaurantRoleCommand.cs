using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.RenameRestaurantRole
{
    public class RenameRestaurantRoleCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid RoleId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }

        public required string NewName { get; set; }
    }
}