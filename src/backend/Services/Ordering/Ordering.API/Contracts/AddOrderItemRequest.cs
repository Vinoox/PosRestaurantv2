using System;

namespace Ordering.API.Contracts;

public record AddOrderItemRequest(Guid ProductId, int Quantity);