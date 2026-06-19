using System;
using System.Collections.Generic;
using System.Linq;
using Ordering.Domain.Enums;
using Ordering.Domain.Exceptions;
using PosRestaurant.Shared.Entities;

namespace Ordering.Domain.Entities;

public class Order : BaseEntity
{
    public Guid RestaurantId { get; private set; }
    public OrderStatus Status { get; private set; }
    public string? TableNumber { get; private set; }
    public decimal TotalAmount { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<OrderItem> _items = new();
    public virtual IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private Order() { }

    public static Order Create(Guid restaurantId, string? tableNumber)
    {
        if (restaurantId == Guid.Empty) throw new OrderDomainException("RestaurantId nie może być puste.");

        return new Order
        {
            RestaurantId = restaurantId,
            TableNumber = tableNumber,
            Status = OrderStatus.Open,
            TotalAmount = 0m,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity)
    {
        if (Status != OrderStatus.Open)
            throw new OrderDomainException("Nie można dodać pozycji do zamkniętego zamówienia.");

        var existingItem = _items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + quantity;
            _items.Remove(existingItem);
            _items.Add(OrderItem.Create(Id, productId, productName, unitPrice, newQuantity)); // Tworzymy nowy snapshot
        }
        else
        {
            _items.Add(OrderItem.Create(Id, productId, productName, unitPrice, quantity));
        }

        RecalculateTotal();
    }

    public void RemoveItem(Guid orderItemId)
    {
        if (Status != OrderStatus.Open)
            throw new OrderDomainException("Nie można usunąć pozycji z zamkniętego zamówienia.");

        var item = _items.FirstOrDefault(i => i.Id == orderItemId);
        if (item == null) throw new OrderDomainException("Nie znaleziono pozycji w zamówieniu.");

        _items.Remove(item);
        RecalculateTotal();
    }

    public void MarkAsPaid()
    {
        if (Status == OrderStatus.Paid) throw new OrderDomainException("Zamówienie jest już opłacone.");
        if (Status == OrderStatus.Cancelled) throw new OrderDomainException("Nie można opłacić anulowanego zamówienia.");
        if (!_items.Any()) throw new OrderDomainException("Nie można opłacić pustego zamówienia.");

        Status = OrderStatus.Paid;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Paid) throw new OrderDomainException("Nie można anulować opłaconego zamówienia.");

        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotal()
    {
        TotalAmount = _items.Sum(i => i.UnitPrice * i.Quantity);
        UpdatedAt = DateTime.UtcNow;
    }
}