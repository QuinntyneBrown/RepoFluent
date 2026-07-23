using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RepoFluent.Api;

namespace RepoFluent.Api.IntegrationTests;

internal sealed class TestApplicationFactory : WebApplicationFactory<Program>
{
    private readonly bool _enableValidationWorker;

    private readonly string _databasePath = Path.Combine(
        Path.GetTempPath(),
        $"repofluent-{Guid.NewGuid():N}.db");

    public TestApplicationFactory(bool enableValidationWorker = true)
    {
        _enableValidationWorker = enableValidationWorker;
    }

    public string DatabasePath => _databasePath;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:RepoFluent", $"Data Source={_databasePath}");
        if (!_enableValidationWorker)
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.Single(
                    item => item.ServiceType == typeof(IHostedService)
                        && item.ImplementationType == typeof(CurriculumValidationWorker));
                services.Remove(descriptor);
            });
        }
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        SqliteConnection.ClearAllPools();
        if (disposing && File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }
}
