using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Interfaces;
using Ordering.Domain.Entities;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions; 

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
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);

        if (order == null || order.RestaurantId != request.RestaurantId)
        {
            throw new NotFoundException(nameof(Order), request.OrderId);
        }

        var productSnapshot = await _catalogServiceClient.GetProductSnapshotAsync(
            request.ProductId,
            request.RestaurantId,
            request.AccessToken,
            cancellationToken);

        if (productSnapshot == null)
        {
            throw new BadRequestException("Produkt nie istnieje w menu lub brak uprawnień.");
        }

        // Domenowe utworzenie snapshotu na paragonie
        order.AddOrderItem(
            productSnapshot.Id,
            productSnapshot.Name,
            productSnapshot.Price,
            request.Quantity);

        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Unit.Value;
    }
}