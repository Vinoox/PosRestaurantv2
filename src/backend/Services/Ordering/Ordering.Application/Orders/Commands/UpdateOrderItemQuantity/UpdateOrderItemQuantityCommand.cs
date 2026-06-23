using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.UpdateOrderItemQuantity;

public record UpdateOrderItemQuantityCommand(
    Guid OrderId,
    Guid OrderItemIdOrProductId,
    int Quantity,
    Guid RestaurantId
) : IRequest;