using System;

namespace Identity.Application.Users.Queries.GetUser
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }
}