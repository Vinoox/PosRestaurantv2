using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Interfaces;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions; // Zakładam, że przeniosłeś bazowe wyjątki (np. NotFoundException) do Shared, lub użyjemy lokalnego wyjątku.

namespace Ordering.Application.Orders.Commands.AddOrderItem;

public class AddOrderItemCommandHandler : IRequestHandler<AddOrderItemCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICatalogServiceClient _catalogServiceClient;

    public AddOrderItemCommandHandler(IOrderRepository orderRepository, ICatalogServiceClient catalogServiceClient)
    {
        _orderRepository = orderRepository;
        _catalogServiceClient = catalogServiceClient;
    }

    public async Task<Unit> Handle(AddOrderItemCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId, request.RestaurantId, cancellationToken);

        if (order == null)
        {
            throw new Exception($"Nie znaleziono zamówienia {request.OrderId}");
        }

        var productSnapshot = await _catalogServiceClient.GetProductSnapshotAsync(
            request.ProductId,
            request.RestaurantId,
            request.AccessToken,
            cancellationToken);

        if (productSnapshot == null)
        {
            throw new Exception("Produkt nie istnieje w menu lub brak uprawnień.");
        }

        order.AddItem(
            productSnapshot.Id,
            productSnapshot.Name,
            productSnapshot.Price,
            request.Quantity);

        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Unit.Value;
    }
}