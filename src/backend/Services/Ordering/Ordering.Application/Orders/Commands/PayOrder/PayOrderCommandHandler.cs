using System;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
using Ordering.Domain.Entities;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Messaging.Events;

namespace Ordering.Application.Orders.Commands.PayOrder;

public class PayOrderCommandHandler : IRequestHandler<PayOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public PayOrderCommandHandler(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Unit> Handle(PayOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);

        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        order.MarkAsPaid();

        await _orderRepository.UpdateAsync(order, cancellationToken);

        var integrationEvent = new OrderPaidIntegrationEvent(
            order.Id,
            order.RestaurantId,
            order.TotalAmount,
            order.PaidAt ?? DateTime.UtcNow
        );

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        return Unit.Value;
    }
}