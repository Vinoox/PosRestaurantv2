using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.ChangeEmployeeRole;

public record ChangeEmployeeRoleCommand(
    Guid RestaurantId,
    Guid EmployeeId,
    Guid NewRoleId,
    Guid RequesterId) : IRequest<Unit>;