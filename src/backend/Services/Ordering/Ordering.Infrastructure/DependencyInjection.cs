using System;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.Application.Interfaces;
using Ordering.Domain.Interfaces;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Repositories;
using Ordering.Infrastructure.Services;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<OrderingDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("OrderingConnection"),
                b => b.MigrationsAssembly(typeof(OrderingDbContext).Assembly.FullName)));

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IOrderRepository, OrderRepository>();

        // NAPRAWA 500: Wyciąganie prawidłowego URL do serwisu katalogu z docker-compose
        var catalogUrl = configuration["CatalogApi:BaseUrl"] ?? configuration["Microservices:Catalog"] ?? "http://catalog-api:8080";

        services.AddHttpClient<ICatalogServiceClient, CatalogServiceClient>(client =>
        {
            client.BaseAddress = new Uri(catalogUrl);
        });

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();
            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitMqHost = configuration["RabbitMq:Host"] ?? "localhost";
                cfg.Host(rabbitMqHost, "/", h => {
                    h.Username(configuration["RabbitMq:Username"] ?? "guest");
                    h.Password(configuration["RabbitMq:Password"] ?? "guest");
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}