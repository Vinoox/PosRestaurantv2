using System;
using Identity.API.Infrastructure;
using Identity.API.Services;
using Identity.Application;
using Identity.Infrastructure;
using Identity.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using PosRestaurant.Shared.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireRestaurantManager", policy =>
        policy.RequireClaim("restaurantRole", "Manager", "LocalAdmin"));
});

builder.Services.AddSwaggerGen(c =>
{
    c.EnableAnnotations();

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Wklej token JWT w poniższe pole zaczynając od słowa 'Bearer ', np.: 'Bearer eyJhbG...'",
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

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<IdentityDbContext>();
        await context.Database.MigrateAsync();

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        var globalRoles = new[] { "Admin", "Premium", "Default" };

        foreach (var role in globalRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Wystąpił błąd podczas migracji lub seedowania bazy danych.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();