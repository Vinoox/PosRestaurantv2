using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.CompleteOrder;

public record CompleteOrderCommand(Guid OrderId, Guid RestaurantId) : IRequest;