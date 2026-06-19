using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ordering.Application.Interfaces;

public record ProductSnapshotDto(Guid Id, string Name, decimal Price);

public interface ICatalogServiceClient
{
    Task<ProductSnapshotDto?> GetProductSnapshotAsync(Guid productId, Guid restaurantId, string token, CancellationToken cancellationToken = default);
}