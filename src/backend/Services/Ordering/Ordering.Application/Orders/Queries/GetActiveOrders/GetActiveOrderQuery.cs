using System;
using System.Collections.Generic;
using MediatR;
using Ordering.Application.Orders.Dtos;

namespace Ordering.Application.Orders.Queries.GetActiveOrders;

public record GetActiveOrdersQuery(Guid RestaurantId) : IRequest<List<OrderDto>>;