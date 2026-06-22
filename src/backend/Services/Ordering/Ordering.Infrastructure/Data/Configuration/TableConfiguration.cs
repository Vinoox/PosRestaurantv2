using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Entities;

namespace Ordering.Infrastructure.Data.Configuration;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.ToTable("Tables");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Number).IsRequired();
        builder.Property(t => t.SeatsCount).IsRequired();
        builder.Property(t => t.Zone).HasMaxLength(100);
        builder.Property(t => t.IsOccupied).IsRequired();
        builder.Property(t => t.RestaurantId).IsRequired();

        builder.HasIndex(t => new { t.RestaurantId, t.Number }).IsUnique();
    }
}