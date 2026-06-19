using System;
using MediatR;

namespace Identity.Application.Restaurants.Commands.AddEmployee;

public record AddEmployeeCommand(
    Guid RestaurantId,
    string EmployeeEmail,
    Guid RoleId,
    Guid RequesterId) : IRequest<Unit>;