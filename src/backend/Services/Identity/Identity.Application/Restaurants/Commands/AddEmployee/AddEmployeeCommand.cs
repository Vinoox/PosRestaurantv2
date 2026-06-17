using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Restaurants.Commands.AddEmployee
{
    public class AddEmployeeCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid RestaurantId { get; set; }

        [JsonIgnore]
        public Guid RequesterId { get; set; }

        public required string EmployeeEmail { get; set; }
        public required Guid RoleId { get; set; }
    }
}