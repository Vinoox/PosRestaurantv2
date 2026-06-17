using System;
using System.Text.Json.Serialization;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Identity.Application.Users.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest<IdentityResult>
    {
        [JsonIgnore]
        public Guid UserId { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }
}