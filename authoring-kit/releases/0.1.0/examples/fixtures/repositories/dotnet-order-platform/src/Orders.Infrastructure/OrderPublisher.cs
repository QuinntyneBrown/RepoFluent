namespace Orders.Infrastructure;

public sealed class OrderPublisher
{
    public Task PublishAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
