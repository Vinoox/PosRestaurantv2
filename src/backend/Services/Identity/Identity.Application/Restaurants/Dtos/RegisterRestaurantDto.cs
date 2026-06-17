namespace Identity.Application.Restaurants.Dtos
{
    public record RegisterRestaurantDto(string Name, string? Address, string? TaxId);
}