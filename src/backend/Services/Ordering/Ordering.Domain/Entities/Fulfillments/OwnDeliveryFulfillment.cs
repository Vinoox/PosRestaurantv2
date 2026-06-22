using System;

namespace Ordering.Domain.Entities.Fulfillments;

public class OwnDeliveryFulfillment : Fulfillment
{
    public required string Street { get; set; }
    public required string BuildingNumber { get; set; }
    public string? ApartmentNumber { get; set; }
    public string? City { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? DriverEmployeeId { get; set; }
}