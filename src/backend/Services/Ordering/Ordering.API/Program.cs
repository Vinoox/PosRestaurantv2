using System;
using System.Text;
using System.Text.Json.Serialization;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Ordering.Application.Interfaces;
using Ordering.Domain.Interfaces;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Repositories;
using Ordering.Infrastructure.Services;
using PosRestaurant.Shared.Infrastructure;
using PosRestaurant.Shared.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Konfiguracja Bazy Danych
builder.Services.AddDbContext<OrderingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderingConnection")));

// 2. Konfiguracja DI (Dependency Injection)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// Poprawka DI: Rejestracja generycznego repozytorium (np. dla Table)
builder.Services.AddScoped(typeof(PosRestaurant.Shared.Interfaces.IGenericRepository<>), typeof(Ordering.Infrastructure.Data.GenericRepository<>));

// 3. Konfiguracja MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Ordering.Application.Orders.Commands.CreateOrder.CreateOrderCommand).Assembly));

// 4. Konfiguracja MassTransit (RabbitMQ)
builder.Services.AddMassTransit(x =>
{
    // Utrzymanie czystych nazw kolejek wzorem dobrych praktyk
    x.SetKebabCaseEndpointNameFormatter(); 
    
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = builder.Configuration["RabbitMq:Host"];
        var rabbitUser = builder.Configuration["RabbitMq:Username"];
        var rabbitPass = builder.Configuration["RabbitMq:Password"];

        cfg.Host(rabbitHost, "/", h => {
            h.Username(rabbitUser);
            h.Password(rabbitPass);
        });

        cfg.ConfigureEndpoints(context);
    });
});

// 5. Klienci HTTP (Komunikacja synchroniczna z Catalog API)
builder.Services.AddHttpClient<ICatalogServiceClient, CatalogServiceClient>(client =>
{
    var catalogUrl = builder.Configuration["CatalogApi:BaseUrl"];
    client.BaseAddress = new Uri(catalogUrl!);
});

// 6. Obsługa błędów
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 7. Autoryzacja i Uwierzytelnianie JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? throw new ArgumentNullException("Brak klucza JWT w konfiguracji!");

builder.Services.AddAuthentication(defaultScheme: JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Minimalne wymaganie dla Ordering - dostęp na poziomie lokalu
    options.AddPolicy("RequireRestaurantAccess", policy =>
        policy.RequireClaim("restaurantId"));
});

// 8. Kontrolery i Serializacja
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Gwarantuje, że statusy (np. OrderStatus) będą wysyłane jako tekst (np. "InPreparation"), a nie cyfry
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
    
builder.Services.AddEndpointsApiExplorer();

// 9. Konfiguracja Swaggera z zabezpieczeniami JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Ordering API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autoryzacja JWT. Wpisz: Bearer {twój_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 10. Automatyczne Migracje przy uruchomieniu kontenera
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();
        await context.Database.MigrateAsync();
        Console.WriteLine("Migracje bazy danych PosRestaurant_OrderingDb zostały pomyślnie zaaplikowane.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Błąd podczas automatycznej migracji bazy danych: {ex.Message}");
    }
}

app.Run();