using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Products.Queries.GetProducts;

public record GetProductsQuery(Guid RestaurantId) : IRequest<IReadOnlyList<ProductListItemDto>>;

public record ProductListItemDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable
);