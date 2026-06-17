using System;
using System.Collections.Generic;
using Catalog.Application.Categories.Dtos;
using MediatR;

namespace Catalog.Application.Categories.Queries.GetCategories;

public record GetCategoriesQuery(Guid RestaurantId) : IRequest<IReadOnlyList<CategoryDto>>;