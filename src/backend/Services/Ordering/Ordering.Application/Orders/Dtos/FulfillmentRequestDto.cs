using System;

namespace Ordering.Application.Orders.Dtos;

public record FulfillmentRequestDto(
    Guid? OrderId,
    string FulfillmentType,
    Guid? TableId,
    int? TableNumber,
    string? CustomerName,
    string? PhoneNumber,
    DateTime? PickupTime,
    string? Street,
    string? BuildingNumber,
    string? ApartmentNumber,
    string? City,
    Guid? DriverEmployeeId,
    string? ProviderName,
    string? PickupCode,
    decimal? DeclaredExternalTotal,
    string? DeliveryAddress,
    string? ServiceNote
);