using PosRestaurant.Shared.Entities;
using System;

namespace Identity.Domain.Entities;

public class RestaurantMember : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid RestaurantId { get; private set; }
    public Guid RestaurantRoleId { get; private set; }
    public virtual RestaurantRole RestaurantRole { get; private set; } = null!;
    public virtual Restaurant Restaurant { get; private set; } = null!;

    private RestaurantMember() { }

    public static RestaurantMember Create(Guid userId, Guid restaurantId, RestaurantRole role)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId nie może być puste.");
        if (restaurantId == Guid.Empty) throw new ArgumentException("RestaurantId nie może być puste.");

        return new RestaurantMember
        {
            UserId = userId,
            RestaurantId = restaurantId,
            RestaurantRole = role,
            RestaurantRoleId = role.Id
        };
    }

    public void ChangeRole(Guid newRoleId)
    {
        if (newRoleId == Guid.Empty)
            throw new ArgumentException("Identyfikator nowej roli nie może być pusty.");

        RestaurantRoleId = newRoleId;
    }
}