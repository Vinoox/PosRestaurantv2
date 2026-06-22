using System;
using Ordering.Domain.Exceptions;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Domain.Entities;

public class Table : BaseAuditableEntity, IMultiTenantEntity
{
    public int Number { get; private set; }
    public int SeatsCount { get; private set; }
    public string? Zone { get; private set; }
    public bool IsOccupied { get; private set; }
    public Guid RestaurantId { get; set; }

    private Table() { }


    public static Table Create(Guid restaurantId, int number, int seatsCount, string? zone = null)
    {
        if (restaurantId == Guid.Empty)
            throw new OrderDomainException("ID restauracji jest wymagane do utworzenia stolika.");

        if (number <= 0)
            throw new OrderDomainException("Numer stolika musi być większy niż 0.");

        if (seatsCount <= 0)
            throw new OrderDomainException("Liczba miejsc przy stoliku musi być większa niż 0.");

        return new Table
        {
            RestaurantId = restaurantId,
            Number = number,
            SeatsCount = seatsCount,
            Zone = zone?.Trim(),
            IsOccupied = false
        };
    }


    public void UpdateDetails(int number, int seatsCount, string? zone)
    {
        if (number <= 0) throw new OrderDomainException("Numer stolika musi być większy niż 0.");
        if (seatsCount <= 0) throw new OrderDomainException("Liczba miejsc musi być większa niż 0.");

        Number = number;
        SeatsCount = seatsCount;
        Zone = zone?.Trim();
    }

    public void Occupy()
    {
        if (IsOccupied)
            throw new OrderDomainException($"Stolik nr {Number} jest już zajęty przez innych gości!");

        IsOccupied = true;
    }

    public void Release()
    {
        if (!IsOccupied)
            throw new OrderDomainException($"Stolik nr {Number} nie był zajęty.");

        IsOccupied = false;
    }
}