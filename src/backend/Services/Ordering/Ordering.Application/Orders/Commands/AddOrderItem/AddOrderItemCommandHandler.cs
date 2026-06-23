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
        // 1. Pobranie zamówienia z bazy właściwą metodą repozytorium
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);

        // 2. Weryfikacja istnienia i uprawnień do modyfikacji
        if (order == null || order.RestaurantId != request.RestaurantId)
        {
            throw new NotFoundException(nameof(Order), request.OrderId);
        }

        // 3. Pobranie aktualnych danych produktu z serwisu Katalogu (Cena, Nazwa)
        var productSnapshot = await _catalogServiceClient.GetProductSnapshotAsync(
            request.ProductId,
            request.RestaurantId,
            request.AccessToken,
            cancellationToken);

        if (productSnapshot == null)
        {
            throw new BadRequestException("Nie udało się pobrać produktu z katalogu. Sprawdź czy istnieje i czy masz uprawnienia.");
        }

        // 4. Dodanie pozycji do zamówienia (Logika domenowa wewnątrz encji Order)
        order.AddOrderItem(
            productSnapshot.Id,
            productSnapshot.Name,
            productSnapshot.Price,
            request.Quantity);

        // 5. Zapis do bazy
        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Unit.Value;
    }
}