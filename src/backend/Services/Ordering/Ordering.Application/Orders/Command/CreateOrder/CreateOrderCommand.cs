using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand(Guid RestaurantId, string? TableNumber) : IRequest<Guid>;