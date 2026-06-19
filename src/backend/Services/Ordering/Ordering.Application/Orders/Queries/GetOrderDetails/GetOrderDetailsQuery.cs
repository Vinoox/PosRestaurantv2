using System;
using MediatR;
using Ordering.Application.Orders.Dtos;

namespace Ordering.Application.Orders.Queries.GetOrderDetails;

public record GetOrderDetailsQuery(Guid OrderId, Guid RestaurantId) : IRequest<OrderDto>;