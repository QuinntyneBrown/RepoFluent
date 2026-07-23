namespace Orders.Worker;

public sealed class OrderWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
    }
}
