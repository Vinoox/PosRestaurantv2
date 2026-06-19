using System;
using Catalog.Application.Products.Dtos;
using MediatR;

namespace Catalog.Application.Products.Queries.GetProductById;

public record GetProductByIdQuery(Guid Id, Guid RestaurantId) : IRequest<ProductDto>;