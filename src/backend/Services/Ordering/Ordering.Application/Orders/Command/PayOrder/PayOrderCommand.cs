using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.PayOrder;

public record PayOrderCommand(Guid OrderId, Guid RestaurantId) : IRequest<Unit>;