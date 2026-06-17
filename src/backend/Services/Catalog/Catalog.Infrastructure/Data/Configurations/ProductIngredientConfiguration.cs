using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Data.Configurations;

public class ProductIngredientConfiguration : IEntityTypeConfiguration<ProductIngredient>
{
    public void Configure(EntityTypeBuilder<ProductIngredient> builder)
    {
        builder.HasKey(pi => new { pi.ProductId, pi.IngredientId });

        builder.Property(pi => pi.QuantityUsed).HasPrecision(18, 4);

        builder.HasOne(pi => pi.Product)
               .WithMany(p => p.ProductIngredients)
               .HasForeignKey(pi => pi.ProductId);

        builder.HasOne(pi => pi.Ingredient)
               .WithMany(i => i.ProductIngredients)
               .HasForeignKey(pi => pi.IngredientId);
    }
}