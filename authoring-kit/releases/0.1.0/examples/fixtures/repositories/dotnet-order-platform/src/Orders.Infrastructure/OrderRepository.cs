using Orders.Domain;

namespace Orders.Infrastructure;

public sealed class OrderRepository
{
    public Task SaveAsync(Guid orderId, CreateOrder request, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
