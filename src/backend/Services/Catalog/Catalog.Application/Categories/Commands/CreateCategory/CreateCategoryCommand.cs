using System;
using Catalog.Application.Categories.Dtos;
using MediatR;

namespace Catalog.Application.Categories.Commands.CreateCategory;

public record CreateCategoryCommand(string Name, string? Description, Guid RestaurantId) : IRequest<CategoryDto>;