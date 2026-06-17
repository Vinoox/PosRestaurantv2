using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Users.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommand : IRequest
    {
        [JsonIgnore]
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}