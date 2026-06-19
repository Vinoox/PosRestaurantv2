using PosRestaurant.Shared.Exceptions;
namespace Ordering.Domain.Exceptions;

public class OrderDomainException : DomainException
{
    public OrderDomainException(string message) : base(message) { }
}