using System.Threading.Tasks;
using MassTransit;
using MongoDB.Driver;
using Analytics.API.Models;
using PosRestaurant.Shared.Messaging.Events;

namespace Analytics.API.Consumers;

public class OrderPaidIntegrationEventConsumer : IConsumer<OrderPaidIntegrationEvent>
{
    private readonly IMongoCollection<OrderDocument> _ordersCollection;

    public OrderPaidIntegrationEventConsumer(IMongoDatabase mongoDatabase)
    {
        _ordersCollection = mongoDatabase.GetCollection<OrderDocument>("PaidOrders");
    }

    public async Task Consume(ConsumeContext<OrderPaidIntegrationEvent> context)
    {
        var message = context.Message;

        var orderDocument = new OrderDocument
        {
            OrderId = message.OrderId,
            RestaurantId = message.RestaurantId,
            TotalAmount = message.TotalAmount,
            PaidAt = message.PaidAt
        };

        await _ordersCollection.InsertOneAsync(orderDocument, cancellationToken: context.CancellationToken);
    }
}