using RepoFluent.Application;

namespace RepoFluent.Api;

public sealed class CurriculumValidationWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<CurriculumValidationWorker> logger) : BackgroundService
{
    private static readonly Action<ILogger, Exception?> LogIterationFailure = LoggerMessage.Define(
        LogLevel.Error,
        new EventId(1001, "CurriculumValidationIterationFailed"),
        "Curriculum validation worker iteration failed.");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var workflow = scope.ServiceProvider.GetRequiredService<CurriculumWorkflow>();
                await workflow.ValidateNextAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                LogIterationFailure(logger, exception);
            }

            await Task.Delay(TimeSpan.FromMilliseconds(100), stoppingToken);
        }
    }
}
