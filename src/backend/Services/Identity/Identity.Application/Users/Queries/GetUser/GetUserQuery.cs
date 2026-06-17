using System;
using MediatR;

namespace Identity.Application.Users.Queries.GetUser
{
    public record GetUserQuery(Guid UserId) : IRequest<UserDto>;
}