using System;
using Ordering.Domain.Exceptions;
using PosRestaurant.Shared.Entities;

namespace Ordering.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }

    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }

    public int Quantity { get; private set; }

    public virtual Order Order { get; private set; } = null!;

    private OrderItem() { }

    internal static OrderItem Create(Guid orderId, Guid productId, string productName, decimal unitPrice, int quantity)
    {
        if (quantity <= 0) throw new OrderDomainException("Ilość musi być większa niż 0.");
        if (unitPrice < 0) throw new OrderDomainException("Cena jednostkowa nie może być ujemna.");

        return new OrderItem
        {
            OrderId = orderId,
            ProductId = productId,
            ProductName = productName,
            UnitPrice = unitPrice,
            Quantity = quantity
        };
    }
}