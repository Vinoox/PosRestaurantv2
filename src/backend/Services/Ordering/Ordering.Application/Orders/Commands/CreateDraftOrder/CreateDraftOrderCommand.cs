using System;
using MediatR;

namespace Ordering.Application.Orders.Commands.CreateDraftOrder;

public record CreateDraftOrderCommand(Guid RestaurantId) : IRequest<Guid>;