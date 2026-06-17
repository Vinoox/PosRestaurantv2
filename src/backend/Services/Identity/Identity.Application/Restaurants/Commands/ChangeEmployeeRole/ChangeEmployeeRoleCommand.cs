using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.ChangeEmployeeRole
{
    public class ChangeEmployeeRoleCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid EmployeeId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }

        public required Guid NewRoleId { get; set; }
    }
}