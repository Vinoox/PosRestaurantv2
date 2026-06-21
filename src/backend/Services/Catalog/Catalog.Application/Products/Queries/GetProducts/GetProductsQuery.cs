using System;
using System.Collections.Generic;
using Catalog.Application.Products.Dtos;
using MediatR;

namespace Catalog.Application.Products.Queries.GetProducts;

public record GetProductsQuery(Guid RestaurantId) : IRequest<IEnumerable<ProductDto>>;