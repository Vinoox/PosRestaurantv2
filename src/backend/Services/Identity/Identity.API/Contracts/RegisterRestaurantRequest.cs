namespace Identity.API.Contracts;

public record RegisterRestaurantRequest(string Name, string? Address, string? TaxId);