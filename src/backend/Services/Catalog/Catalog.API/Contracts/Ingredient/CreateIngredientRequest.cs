using Catalog.Domain.Enums;

namespace Catalog.API.Contracts.Ingredient;

public record CreateIngredientRequest(string Name, Unit Unit, decimal InitialStock);