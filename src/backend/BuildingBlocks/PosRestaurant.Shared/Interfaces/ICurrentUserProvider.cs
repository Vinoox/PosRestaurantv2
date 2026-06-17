namespace PosRestaurant.Shared.Interfaces;

public interface ICurrentUserProvider
{
    string? UserId { get; }
    int? RestaurantId { get; }
    bool IsAuthenticated { get; }
}