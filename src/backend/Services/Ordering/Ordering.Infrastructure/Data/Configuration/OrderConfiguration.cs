using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Entities;
using Ordering.Domain.Entities.Fulfillments;

namespace Ordering.Infrastructure.Data.Configuration;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.TotalAmount).HasPrecision(18, 2);

        builder.HasMany(o => o.OrderItems)
               .WithOne(oi => oi.Order)
               .HasForeignKey(oi => oi.OrderId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Fulfillment)
               .WithOne(f => f.Order)
               .HasForeignKey<Fulfillment>(f => f.OrderId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Cascade);


        builder.HasIndex(o => new { o.RestaurantId, o.Status })
               .HasDatabaseName("IX_Orders_Active_Filtered")
               .HasFilter("[Status] < 2");
    }
}