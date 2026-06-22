using System;

namespace Ordering.Application.Orders.Dtos;

public record FulfillmentRequestDto(
    string FulfillmentType,
    Guid? TableId,
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
    decimal? DeclaredExternalTotal
);