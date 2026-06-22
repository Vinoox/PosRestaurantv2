using System;
using MediatR;
using Ordering.Application.Orders.Dtos;

namespace Ordering.Application.Orders.Commands.AssignFulfillment;

public record AssignFulfillmentCommand(
    Guid OrderId,
    FulfillmentRequestDto FulfillmentData,
    Guid RestaurantId
) : IRequest;