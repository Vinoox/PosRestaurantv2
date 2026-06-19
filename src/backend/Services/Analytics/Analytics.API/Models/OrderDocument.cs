using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Analytics.API.Models;

public class OrderDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid OrderId { get; set; }

    [BsonRepresentation(BsonType.String)]
    public Guid RestaurantId { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal TotalAmount { get; set; }

    [BsonRepresentation(BsonType.DateTime)]
    public DateTime PaidAt { get; set; }
}