using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.RemoveEmployee
{
    public record RemoveEmployeeCommand(Guid RestaurantId, Guid EmployeeId, Guid RequesterId) : IRequest<Unit>;
}