using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Identity.Application.Interfaces
{
    public interface IIdentityDbContext
    {
        DbSet<User> Users { get; set; }

        DbSet<Restaurant> Restaurants { get; set; }
        DbSet<RestaurantRole> RestaurantRoles { get; set; }
        DbSet<RestaurantMember> RestaurantMembers { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}