using System;
using MediatR;

namespace Identity.Application.Users.Queries.GetUser
{
    public class GetUserQuery : IRequest<UserDto>
    {
        public Guid UserId { get; set; }
    }
}