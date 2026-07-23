using Orders.Infrastructure;

namespace Orders.Domain;

public sealed class OrderService(OrderRepository repository, OrderPublisher publisher)
{
    public async Task<Guid> Place(CreateOrder request, CancellationToken cancellationToken)
    {
        var orderId = Guid.NewGuid();
        await repository.SaveAsync(orderId, request, cancellationToken);
        await publisher.PublishAsync(orderId, cancellationToken);
        return orderId;
    }
}

public sealed record CreateOrder(string Sku, int Quantity);
