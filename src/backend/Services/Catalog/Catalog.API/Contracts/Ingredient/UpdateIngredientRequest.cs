using Catalog.Domain.Enums;

namespace Catalog.API.Contracts.Ingredient;

public record UpdateIngredientRequest(string Name, Unit Unit, decimal StockQuantity);