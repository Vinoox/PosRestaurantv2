using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.RemoveOrderItem;

public record RemoveOrderItemCommand(
    Guid OrderId,
    Guid ProductId,
    Guid RestaurantId
) : IRequest;