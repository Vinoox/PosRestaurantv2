using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Identity.Domain.Entities;

namespace Identity.Application.Auth.Commands.RegisterUser
{
    public class RegisterUserCommand
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public required string Pin { get; set; }
    }
}
