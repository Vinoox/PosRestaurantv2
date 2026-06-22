using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Entities.Fulfillments;

namespace Ordering.Infrastructure.Data.Configuration;

public class FulfillmentConfiguration : IEntityTypeConfiguration<Fulfillment>
{
    public void Configure(EntityTypeBuilder<Fulfillment> builder)
    {
        builder.ToTable("OrderFulfillments");
        builder.HasKey(f => f.Id);

        builder.HasDiscriminator<string>("FulfillmentType")
               .HasValue<DineInFulfillment>("DINE_IN")
               .HasValue<TakeawayFulfillment>("TAKEAWAY")
               .HasValue<OwnDeliveryFulfillment>("OWN_DELIVERY")
               .HasValue<AggregatorFulfillment>("AGGREGATOR");
    }
}

public class DineInFulfillmentConfiguration : IEntityTypeConfiguration<DineInFulfillment>
{
    public void Configure(EntityTypeBuilder<DineInFulfillment> builder)
    {
        builder.HasOne(d => d.Table)
               .WithMany()
               .HasForeignKey(d => d.TableId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class TakeawayFulfillmentConfiguration : IEntityTypeConfiguration<TakeawayFulfillment>
{
    public void Configure(EntityTypeBuilder<TakeawayFulfillment> builder)
    {
        builder.Property(t => t.CustomerName).HasMaxLength(150);
        builder.Property(t => t.PhoneNumber).HasMaxLength(30);
    }
}

public class OwnDeliveryFulfillmentConfiguration : IEntityTypeConfiguration<OwnDeliveryFulfillment>
{
    public void Configure(EntityTypeBuilder<OwnDeliveryFulfillment> builder)
    {
        builder.Property(o => o.Street).HasMaxLength(200);
        builder.Property(o => o.BuildingNumber).HasMaxLength(20);
        builder.Property(o => o.ApartmentNumber).HasMaxLength(20);
        builder.Property(o => o.City).HasMaxLength(100);
        builder.Property(o => o.PhoneNumber).HasMaxLength(30);
    }
}

public class AggregatorFulfillmentConfiguration : IEntityTypeConfiguration<AggregatorFulfillment>
{
    public void Configure(EntityTypeBuilder<AggregatorFulfillment> builder)
    {
        builder.Property(a => a.ProviderName).HasMaxLength(50);
        builder.Property(a => a.PickupCode).HasMaxLength(50);
        builder.Property(a => a.DeclaredExternalTotal).HasPrecision(18, 2);
    }
}