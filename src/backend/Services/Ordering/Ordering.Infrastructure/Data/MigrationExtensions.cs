using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Ordering.Infrastructure.Data;

public static class MigrationExtensions
{
    public static async Task ApplyDatabaseMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<OrderingDbContext>>();
        var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();

        int maxRetries = 5;
        for (int retry = 1; retry <= maxRetries; retry++)
        {
            try
            {
                logger.LogInformation("Próba {Retry}/{MaxRetries}: Sprawdzanie i aplikowanie migracji SQL Servera...", retry, maxRetries);

                await context.Database.MigrateAsync();

                logger.LogInformation("Sukces! Baza danych jest w 100% zaktualizowana");
                return;
            }
            catch (Exception ex)
            {
                if (retry == maxRetries)
                {
                    logger.LogCritical(ex, "Krytyczny błąd: Nie udało się połączyć z bazą SQL po {MaxRetries} próbach.", maxRetries);
                    throw;
                }

                logger.LogWarning("Baza SQL Server odrzuca połączenie (prawdopodobnie jeszcze wstaje wewnątrz Dockera). Czekam 4 sekundy...");
                await Task.Delay(4000);
            }
        }
    }
}