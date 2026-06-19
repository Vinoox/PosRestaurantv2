using System;
using MediatR;

namespace Catalog.Application.Products.Commands.DeleteProduct;

public record DeleteProductCommand(Guid Id, Guid RestaurantId) : IRequest;