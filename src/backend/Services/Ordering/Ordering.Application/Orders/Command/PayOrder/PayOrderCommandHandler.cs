using System;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
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
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId, request.RestaurantId, cancellationToken);

        if (order == null)
        {
            throw new NotFoundException($"Nie znaleziono zamówienia {request.OrderId}");
        }

        order.MarkAsPaid();

        await _orderRepository.UpdateAsync(order, cancellationToken);

        var integrationEvent = new OrderPaidIntegrationEvent(
            order.Id,
            order.RestaurantId,
            order.TotalAmount,
            order.UpdatedAt ?? DateTime.UtcNow
        );

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        return Unit.Value;
    }
}