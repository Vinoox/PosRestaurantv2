namespace Identity.API.Contracts;

public record UpdateRestaurantDetailsRequest(string Name, string? Address, string? TaxId);