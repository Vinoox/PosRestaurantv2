using System;
using Catalog.Application.Categories.Dtos;
using MediatR;

namespace Catalog.Application.Categories.Queries.GetCategoryById;

public record GetCategoryByIdQuery(Guid Id, Guid RestaurantId) : IRequest<CategoryDto>;