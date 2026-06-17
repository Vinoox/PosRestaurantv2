using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Users.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid UserId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }
}