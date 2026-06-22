using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Orders.Dtos;
using Ordering.Domain.Entities;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;

namespace Ordering.Application.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsQueryHandler : IRequestHandler<GetOrderDetailsQuery, OrderDto>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderDetailsQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<OrderDto> Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);

        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        return new OrderDto(
            order.Id,
            order.RestaurantId,
            order.Status.ToString(),
            ResolveSmartFulfillmentText(order.Fulfillment),
            order.TotalAmount,
            order.OrderDate,
            (int)(DateTime.UtcNow - order.OrderDate).TotalSeconds,
            order.Fulfillment?.GetType().Name.Replace("Fulfillment", "").ToUpper() ?? "CREATED",
            order.OrderItems.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.UnitPrice * i.Quantity
            )).ToList()
        );
    }

    private static string? ResolveSmartFulfillmentText(Fulfillment? fulfillment) => fulfillment switch
    {
        DineInFulfillment d => $"Stolik {d.Table?.Number ?? 0}",
        AggregatorFulfillment a => $"[{a.ProviderName}] #{a.PickupCode}",
        OwnDeliveryFulfillment od => $"Dostawa: {od.Street} {od.BuildingNumber}",
        TakeawayFulfillment t => $"Odbiór: {t.CustomerName ?? "Własny"}",
        _ => "Nowy Rachunek"
    };
}