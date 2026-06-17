using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.API.Services;

public class CurrentUserProvider : ICurrentUserProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var userId) ? userId : null;
        }
    }

    public Guid? RestaurantId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirstValue("restaurantId");
            return Guid.TryParse(id, out var restaurantId) ? restaurantId : null;
        }
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}