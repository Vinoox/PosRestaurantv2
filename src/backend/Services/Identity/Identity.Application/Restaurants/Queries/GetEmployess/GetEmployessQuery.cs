using System;
using System.Collections.Generic;
using MediatR;

namespace Identity.Application.Restaurants.Queries.GetEmployees
{
    public record GetEmployeesQuery(Guid RestaurantId, Guid RequesterId) : IRequest<List<EmployeeDto>>;
}