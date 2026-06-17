using Microsoft.EntityFrameworkCore;
using Identity.Domain.Entities;

namespace Identity.Application.Interfaces;

public interface IIdentityDbContext
{
    DbSet<User> Users { get; set; }
    DbSet<Restaurant> Restaurants { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}