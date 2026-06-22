using System;
using System.Collections.Generic;

namespace Ordering.Application.Orders.Dtos;

public record OrderDto(
    Guid Id,
    Guid RestaurantId,
    string Status,
    string? TableNumber,
    decimal TotalAmount,
    DateTime CreatedAt,
    int ActiveSeconds,
    string FulfillmentType,
    List<OrderItemDto> Items
);