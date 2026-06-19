namespace PosRestaurant.Shared.Interfaces
{
    public interface IMultiTenantEntity
    {
        Guid RestaurantId { get; set; }
    }
}
