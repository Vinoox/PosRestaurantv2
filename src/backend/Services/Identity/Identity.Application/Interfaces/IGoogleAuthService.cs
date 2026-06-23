using System.Threading.Tasks;

namespace Identity.Application.Interfaces;

public record GoogleUserInfo(string Email, string FirstName, string LastName);

public interface IGoogleAuthService
{
    Task<GoogleUserInfo?> ValidateTokenAsync(string idToken);
}