using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catalog.Application.Products.Queries.GetProducts
{
    public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductListItemDto>>
    {
        private readonly ICatalogDbContext _context;

        public GetProductsQueryHandler(ICatalogDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<ProductListItemDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.RestaurantId == request.RestaurantId)
                .ToListAsync(cancellationToken);

            return products.Select(p => new ProductListItemDto(
                p.Id,
                p.Name,
                p.Description ?? string.Empty,
                p.Price,
                p.Category?.Name ?? "Inne",
                true
            )).ToList();
        }
    }
}