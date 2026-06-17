using System;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Data
{
    public class IdentityDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IIdentityDbContext
    {
        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options)
        {
        }

        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<RestaurantRole> RestaurantRoles { get; set; }
        public DbSet<RestaurantMember> RestaurantMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>().ToTable("Users");
            builder.Entity<IdentityRole<Guid>>().ToTable("Roles");

            builder.Entity<Restaurant>()
                .HasIndex(r => r.Name)
                .IsUnique();

            builder.Entity<RestaurantMember>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(rm => rm.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<RestaurantMember>()
                .HasOne(rm => rm.Restaurant)
                .WithMany()
                .HasForeignKey(rm => rm.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RestaurantMember>()
                .HasOne(rm => rm.RestaurantRole)
                .WithMany()
                .HasForeignKey(rm => rm.RestaurantRoleId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}