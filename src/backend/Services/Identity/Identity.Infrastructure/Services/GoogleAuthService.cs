using System.Threading.Tasks;
using Google.Apis.Auth;
using Identity.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Identity.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly string _clientId;

    public GoogleAuthService(IConfiguration configuration)
    {
        _clientId = configuration["Google:ClientId"]
            ?? throw new System.ArgumentNullException("Brak konfiguracji Google:ClientId");
    }

    public async Task<GoogleUserInfo?> ValidateTokenAsync(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { _clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new GoogleUserInfo(payload.Email, payload.GivenName, payload.FamilyName);
        }
        catch
        {
            return null;
        }
    }
}