using Catalog.Domain.Enums;

namespace Catalog.API.Contracts;

public record UpdateIngredientRequest(string Name, Unit Unit);