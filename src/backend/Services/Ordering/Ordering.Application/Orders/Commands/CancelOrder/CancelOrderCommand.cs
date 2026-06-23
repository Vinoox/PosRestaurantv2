using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.CancelOrder;

public record CancelOrderCommand(Guid OrderId, Guid RestaurantId) : IRequest;