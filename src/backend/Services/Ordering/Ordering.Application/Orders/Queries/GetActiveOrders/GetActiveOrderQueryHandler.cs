using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Orders.Dtos;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Interfaces;

namespace Ordering.Application.Orders.Queries.GetActiveOrders;

public class GetActiveOrdersQueryHandler : IRequestHandler<GetActiveOrdersQuery, List<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    // WSTRZYKIWANE WYŁĄCZNIE REPOZYTORIUM
    public GetActiveOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<List<OrderDto>> Handle(GetActiveOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetActiveOrdersAsync(request.RestaurantId, cancellationToken);

        return orders.Select(o => new OrderDto(
            o.Id,
            o.RestaurantId,
            o.Status.ToString(),
            ResolveSmartFulfillmentText(o.Fulfillment),
            o.TotalAmount,
            o.OrderDate,
            (int)(DateTime.UtcNow - o.OrderDate).TotalSeconds,
            o.Fulfillment?.GetType().Name.Replace("Fulfillment", "").ToUpper() ?? "DRAFT",
            o.OrderItems.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.UnitPrice * i.Quantity
            )).ToList()
        )).ToList();
    }

    private static string? ResolveSmartFulfillmentText(Fulfillment? fulfillment) => fulfillment switch
    {
        DineInFulfillment d => $"Stolik {d.Table?.Number ?? 0}",
        AggregatorFulfillment a => $"[{a.ProviderName}] #{a.PickupCode}",
        OwnDeliveryFulfillment od => $"Dostawa: {od.Street} {od.BuildingNumber}",
        TakeawayFulfillment t => $"Odbiór: {t.CustomerName ?? "Własny"}",
        _ => "Robocze (Sierota)"
    };
}