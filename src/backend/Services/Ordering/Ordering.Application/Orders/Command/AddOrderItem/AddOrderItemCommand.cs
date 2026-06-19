using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.AddOrderItem;

public record AddOrderItemCommand(
    Guid OrderId,
    Guid RestaurantId,
    Guid ProductId,
    int Quantity,
    string AccessToken) : IRequest<Unit>;