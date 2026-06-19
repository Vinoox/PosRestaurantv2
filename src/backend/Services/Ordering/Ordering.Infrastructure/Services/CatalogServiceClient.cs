using System.Net.Http.Headers;
using System.Net.Http.Json;
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
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _httpClient.GetAsync($"/api/products/{productId}", cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var product = await response.Content.ReadFromJsonAsync<ProductSnapshotDto>(cancellationToken: cancellationToken);
        return product;
    }
}