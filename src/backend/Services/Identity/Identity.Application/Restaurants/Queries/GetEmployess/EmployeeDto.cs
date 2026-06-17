using System;

namespace Identity.Application.Restaurants.Queries.GetEmployees
{
    public class EmployeeDto
    {
        public Guid UserId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public Guid RoleId { get; set; }
        public required string RoleName { get; set; }
    }
}