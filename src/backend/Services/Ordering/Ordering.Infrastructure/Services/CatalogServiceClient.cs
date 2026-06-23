using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Ordering.Application.Interfaces;

namespace Ordering.Infrastructure.Services;

public class CatalogServiceClient : ICatalogServiceClient
{
    private readonly HttpClient _httpClient;

    public CatalogServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ProductSnapshotDto?> GetProductSnapshotAsync(Guid productId, Guid restaurantId, string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/products/{productId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[CatalogServiceClient] Odmowa/Błąd pobierania produktu: {response.StatusCode}");
                return null;
            }

            return await response.Content.ReadFromJsonAsync<ProductSnapshotDto>(cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CatalogServiceClient] Wyjątek połączenia z katalogiem: {ex.Message}");
            return null;
        }
    }
}