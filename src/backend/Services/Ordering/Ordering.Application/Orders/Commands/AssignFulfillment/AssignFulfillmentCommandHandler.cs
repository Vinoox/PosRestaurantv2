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
        // Elastyczne wyciąganie OrderId (z parametru trasy lub z obiektu JSON)
        var targetOrderId = request.OrderId != Guid.Empty ? request.OrderId : (request.FulfillmentData.OrderId ?? Guid.Empty);
        if (targetOrderId == Guid.Empty)
            throw new BadRequestException("Brak identyfikatora zamówienia.");

        var order = await _orderRepository.GetByIdWithDetailsAsync(targetOrderId, cancellationToken);
        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), targetOrderId);

        if (order.Fulfillment is DineInFulfillment oldDineIn)
        {
            var oldTable = await _tableRepository.GetByIdAsync(oldDineIn.TableId, cancellationToken);
            if (oldTable != null)
            {
                oldTable.Release();
                await _tableRepository.UpdateAsync(oldTable, cancellationToken);
            }
        }

        // Normalizacja stringa z frontendu (np. 'DineIn' -> 'DINEIN', 'Delivery' -> 'DELIVERY')
        var fTypeNorm = request.FulfillmentData.FulfillmentType?.ToUpper().Replace("_", "");

        Fulfillment newFulfillment = fTypeNorm switch
        {
            "DINEIN" => await HandleDineInAsync(request.FulfillmentData, request.RestaurantId, cancellationToken),
            "TAKEAWAY" => new TakeawayFulfillment
            {
                CustomerName = request.FulfillmentData.CustomerName ?? "Klient z kasy",
                PhoneNumber = request.FulfillmentData.PhoneNumber,
                PickupTime = request.FulfillmentData.PickupTime
            },
            "DELIVERY" or "OWNDELIVERY" => new OwnDeliveryFulfillment
            {
                Street = request.FulfillmentData.DeliveryAddress ?? request.FulfillmentData.Street ?? "Własna",
                BuildingNumber = request.FulfillmentData.BuildingNumber ?? "-",
                ApartmentNumber = request.FulfillmentData.ApartmentNumber,
                City = request.FulfillmentData.City ?? "Wrocław",
                PhoneNumber = request.FulfillmentData.PhoneNumber,
                DriverEmployeeId = request.FulfillmentData.DriverEmployeeId
            },
            "SERVICES" or "AGGREGATOR" => new AggregatorFulfillment
            {
                ProviderName = request.FulfillmentData.ProviderName ?? "Usługa zewnętrzna",
                PickupCode = request.FulfillmentData.PickupCode ?? "---",
                DeclaredExternalTotal = request.FulfillmentData.DeclaredExternalTotal ?? order.TotalAmount
            },
            "UNASSIGNED" or "DRAFT" => null!,
            _ => throw new BadRequestException($"Nieznany kanał realizacji: {fTypeNorm}")
        };

        if (newFulfillment != null)
        {
            order.AssignFulfillment(newFulfillment);
        }

        await _orderRepository.UpdateAsync(order, cancellationToken);
    }

    private async Task<DineInFulfillment> HandleDineInAsync(FulfillmentRequestDto data, Guid restaurantId, CancellationToken ct)
    {
        Table? table = null;

        if (data.TableId.HasValue && data.TableId.Value != Guid.Empty)
        {
            table = await _tableRepository.GetByIdAsync(data.TableId.Value, ct);
        }
        else if (data.TableNumber.HasValue)
        {
            var allTables = await _tableRepository.GetAllAsync(ct);
            table = allTables.FirstOrDefault(t => t.Number == data.TableNumber.Value && t.RestaurantId == restaurantId);

            if (table == null)
            {
                table = Table.Create(restaurantId, data.TableNumber.Value, 4, "Główna");
                await _tableRepository.AddAsync(table, ct);
            }
        }

        if (table == null || table.RestaurantId != restaurantId)
            throw new NotFoundException(nameof(Table), data.TableNumber ?? 0);

        table.Occupy();
        await _tableRepository.UpdateAsync(table, ct);
        return new DineInFulfillment { TableId = table.Id };
    }
}