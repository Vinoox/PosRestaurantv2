using System;
using System.Text.Json.Serialization;
using MediatR;

namespace Identity.Application.Users.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest
    {
        [JsonIgnore]
        public Guid UserId { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}