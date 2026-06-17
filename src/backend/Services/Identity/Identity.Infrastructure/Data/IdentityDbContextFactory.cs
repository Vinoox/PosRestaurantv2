using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Identity.Infrastructure.Data
{
    public class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
    {
        public IdentityDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();

            var connectionString = "Server=localhost,1433;Database=PosRestaurant_IdentityDb;User Id=sa;Password=YourStrong@Passw0rd!;TrustServerCertificate=True;";

            optionsBuilder.UseSqlServer(connectionString);

            return new IdentityDbContext(optionsBuilder.Options);
        }
    }
}