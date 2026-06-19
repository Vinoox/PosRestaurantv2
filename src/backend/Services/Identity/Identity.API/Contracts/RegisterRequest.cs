namespace Identity.API.Contracts;

public record RegisterRequest(string FirstName, string LastName, string Email, string Password, string ConfirmPassword, string Role = "Default");