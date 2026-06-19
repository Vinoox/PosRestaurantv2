using System;

namespace PosRestaurant.Shared.Interfaces;

public interface ICurrentUserProvider
{
    Guid? UserId { get; }
    Guid? RestaurantId { get; }
    bool IsAuthenticated { get; }
}