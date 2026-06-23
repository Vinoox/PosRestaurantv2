using System;
using System.Collections.Generic;
using System.Linq;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Enums;
using Ordering.Domain.Exceptions;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Domain.Entities;

public class Order : BaseAuditableEntity, IMultiTenantEntity
{
    public Guid RestaurantId { get; set; }
    public DateTime OrderDate { get; private set; }
    public DateTime? SubmittedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public bool IsPaid { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public decimal TotalAmount { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Created;

    public List<OrderItem> OrderItems { get; private set; } = new List<OrderItem>();
    public Fulfillment? Fulfillment { get; private set; }

    private Order() { }

    public static Order Create(Guid restaurantId)
    {
        return new Order
        {
            RestaurantId = restaurantId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Created
        };
    }

    public void AddOrderItem(Guid productId, string productName, decimal unitPrice, int quantity = 1)
    {
        if (Status == OrderStatus.Completed || Status == OrderStatus.Canceled)
            throw new OrderDomainException("Nie można modyfikować potraw w zamkniętym lub anulowanym zamówieniu.");

        var existingItem = OrderItems.FirstOrDefault(x => x.ProductId == productId);
        if (existingItem != null)
        {
            existingItem.AddQuantity(quantity);
        }
        else
        {
            OrderItems.Add(OrderItem.Create(this.Id, productId, productName, unitPrice, quantity));
        }

        RecalculateTotal();
    }

    public void UpdateOrderItemQuantity(Guid orderItemIdOrProductId, int quantity)
    {
        if (Status == OrderStatus.Completed || Status == OrderStatus.Canceled)
            throw new OrderDomainException("Nie można modyfikować potraw w zamkniętym lub anulowanym zamówieniu.");

        var item = OrderItems.FirstOrDefault(x => x.Id == orderItemIdOrProductId || x.ProductId == orderItemIdOrProductId);
        if (item != null)
        {
            item.SetQuantity(quantity);
            RecalculateTotal();
        }
    }

    public void RemoveOrderItem(Guid orderItemIdOrProductId)
    {
        if (Status == OrderStatus.Completed || Status == OrderStatus.Canceled)
            throw new OrderDomainException("Nie można usuwać potraw z zamkniętego zamówienia.");

        // Obsługa wyszukiwania po ID encji lub po ID produktu
        var item = OrderItems.FirstOrDefault(x => x.Id == orderItemIdOrProductId || x.ProductId == orderItemIdOrProductId);
        if (item != null)
        {
            OrderItems.Remove(item);
            RecalculateTotal();
        }
    }

    public void AssignFulfillment(Fulfillment fulfillment)
    {
        if (fulfillment == null) throw new ArgumentNullException(nameof(fulfillment));
        if (Status == OrderStatus.Completed || Status == OrderStatus.Canceled)
            throw new OrderDomainException("Nie można zmienić przypisania dla zamkniętego zamówienia.");

        fulfillment.OrderId = this.Id;
        Fulfillment = fulfillment;
        Status = OrderStatus.Assigned;
        SubmittedAt = DateTime.UtcNow;
    }

    public void MarkAsPaid()
    {
        if (IsPaid) throw new OrderDomainException("Zamówienie zostało już opłacone.");
        IsPaid = true;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkAsCompleted()
    {
        if (Status == OrderStatus.Completed) throw new OrderDomainException("Zamówienie jest już ukończone.");
        Status = OrderStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Completed) throw new OrderDomainException("Nie można anulować zrealizowanego zamówienia.");
        Status = OrderStatus.Canceled;
    }

    private void RecalculateTotal()
    {
        TotalAmount = OrderItems.Sum(item => item.UnitPrice * item.Quantity);
    }
}