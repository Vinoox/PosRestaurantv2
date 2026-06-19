using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Analytics.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using PosRestaurant.Shared.Interfaces;

namespace Analytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireRestaurantAccess")]
public class ReportsController : ControllerBase
{
    private readonly IMongoCollection<OrderDocument> _ordersCollection;
    private readonly ICurrentUserProvider _currentUserProvider;

    public ReportsController(IMongoDatabase database, ICurrentUserProvider currentUserProvider)
    {
        _ordersCollection = database.GetCollection<OrderDocument>("PaidOrders");
        _currentUserProvider = currentUserProvider;
    }

    [HttpGet("daily-revenue")]
    public async Task<IActionResult> GetDailyRevenue(CancellationToken cancellationToken)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var today = DateTime.UtcNow.Date;

        var filter = Builders<OrderDocument>.Filter.Where(o =>
            o.RestaurantId == restaurantId.Value && o.PaidAt >= today);

        var ordersList = await _ordersCollection.Find(filter).ToListAsync(cancellationToken);

        var totalOrders = ordersList.Count;
        var totalRevenue = ordersList.Sum(o => o.TotalAmount);

        return Ok(new
        {
            Date = today.ToString("yyyy-MM-dd"),
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            Transactions = ordersList
        });
    }
}