using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Orders.Dtos;
using Ordering.Domain.Entities;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Application.Orders.Commands.AssignFulfillment;

public class AssignFulfillmentCommandHandler : IRequestHandler<AssignFulfillmentCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IGenericRepository<Table> _tableRepository;

    public AssignFulfillmentCommandHandler(IOrderRepository orderRepository, IGenericRepository<Table> tableRepository)
    {
        _orderRepository = orderRepository;
        _tableRepository = tableRepository;
    }

    public async Task Handle(AssignFulfillmentCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);
        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        if (order.OrderItems.Count == 0)
            throw new BadRequestException("Nie można przekazać do realizacji pustego rachunku.");

        if (order.Fulfillment is DineInFulfillment oldDineIn)
        {
            var oldTable = await _tableRepository.GetByIdAsync(oldDineIn.TableId, cancellationToken);
            if (oldTable != null)
            {
                oldTable.Release();
                await _tableRepository.UpdateAsync(oldTable, cancellationToken);
            }
        }

        Fulfillment newFulfillment = request.FulfillmentData.FulfillmentType.ToUpper() switch
        {
            "DINE_IN" => await HandleDineInAsync(request.FulfillmentData, request.RestaurantId, cancellationToken),
            "TAKEAWAY" => new TakeawayFulfillment
            {
                CustomerName = request.FulfillmentData.CustomerName,
                PhoneNumber = request.FulfillmentData.PhoneNumber,
                PickupTime = request.FulfillmentData.PickupTime
            },
            "OWN_DELIVERY" => new OwnDeliveryFulfillment
            {
                Street = request.FulfillmentData.Street!,
                BuildingNumber = request.FulfillmentData.BuildingNumber!,
                ApartmentNumber = request.FulfillmentData.ApartmentNumber,
                City = request.FulfillmentData.City ?? "Wrocław",
                PhoneNumber = request.FulfillmentData.PhoneNumber,
                DriverEmployeeId = request.FulfillmentData.DriverEmployeeId
            },
            "AGGREGATOR" => new AggregatorFulfillment
            {
                ProviderName = request.FulfillmentData.ProviderName ?? "UberEats",
                PickupCode = request.FulfillmentData.PickupCode!,
                DeclaredExternalTotal = request.FulfillmentData.DeclaredExternalTotal ?? order.TotalAmount
            },
            _ => throw new BadRequestException("Nieznany wariant realizacji.")
        };

        order.AssignFulfillment(newFulfillment);
        await _orderRepository.UpdateAsync(order, cancellationToken);
    }

    private async Task<DineInFulfillment> HandleDineInAsync(FulfillmentRequestDto data, Guid restaurantId, CancellationToken ct)
    {
        if (!data.TableId.HasValue) throw new BadRequestException("Wymagane ID stolika.");

        var table = await _tableRepository.GetByIdAsync(data.TableId.Value, ct);
        if (table == null || table.RestaurantId != restaurantId)
            throw new NotFoundException(nameof(Table), data.TableId.Value);

        table.Occupy();

        await _tableRepository.UpdateAsync(table, ct);

        return new DineInFulfillment { TableId = table.Id };
    }
}