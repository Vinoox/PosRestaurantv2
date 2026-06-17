using System;

namespace PosRestaurant.Shared.Interfaces;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}