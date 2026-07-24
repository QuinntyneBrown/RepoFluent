using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumLifecycleOperationsTests
{
    [Fact]
    public async Task StaleValidationIsActionableAndRetryResumesAtValidation()
    {
        using var factory = new TestApplicationFactory(enableValidationWorker: false);
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var store = scope.ServiceProvider.GetRequiredService<ICurriculumStore>();
            var firstAttempt = await store.ClaimReceivedAsync(CancellationToken.None);
            Assert.Equal(receipt.Id, firstAttempt?.Id);
            Assert.Equal(CurriculumStatus.Validating, firstAttempt?.Status);
        }

        await MakeValidationStaleAsync(factory.DatabasePath, receipt.Id);
        SetPersona(client, "author");
        var stale = await client.GetFromJsonAsync<ImportStatus>(
            $"/api/curriculum-imports/{receipt.Id}");

        Assert.NotNull(stale);
        Assert.True(stale.Progress.IsStale);
        Assert.True(stale.Progress.IsActionRequired);
        Assert.Equal("CLI_VALIDATION_STALE", stale.Progress.FailureCode);
        Assert.Equal("Validation", stale.Progress.ActiveStage);
        Assert.Contains("retry", stale.AllowedActions);
        Assert.Equal(receipt.CorrelationId, stale.CorrelationId);

        SetPersona(client, "reviewer");
        var unauthorizedRetry = await client.PostAsync(
            $"/api/curriculum-imports/{receipt.Id}/retry-validation",
            content: null);
        Assert.Equal(HttpStatusCode.Forbidden, unauthorizedRetry.StatusCode);

        SetPersona(client, "author");
        var retryResponse = await client.PostAsync(
            $"/api/curriculum-imports/{receipt.Id}/retry-validation",
            content: null);
        retryResponse.EnsureSuccessStatusCode();
        var queued = await retryResponse.Content.ReadFromJsonAsync<ImportStatus>();
        Assert.Equal(CurriculumStatus.Received, queued?.Status);
        Assert.Equal(1, queued?.ValidationAttemptCount);

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var workflow = scope.ServiceProvider.GetRequiredService<CurriculumWorkflow>();
            await workflow.ValidateNextAsync(CancellationToken.None);
        }

        var completed = await client.GetFromJsonAsync<ImportStatus>(
            $"/api/curriculum-imports/{receipt.Id}");
        Assert.Equal(CurriculumStatus.Draft, completed?.Status);
        Assert.Equal(2, completed?.ValidationAttemptCount);
        Assert.NotNull(completed?.ValidationReport);
        Assert.Equal("Review", completed?.Progress.ActiveStage);

        SetPersona(client, "administrator");
        var gated = await client.GetFromJsonAsync<ImportStatus>(
            $"/api/curriculum-imports/{receipt.Id}");
        Assert.Equal(CurriculumStatus.Draft, gated?.Status);
        Assert.DoesNotContain("publish", gated?.AllowedActions ?? []);

        SetPersona(client, "auditor");
        var history = await client.GetFromJsonAsync<LifecycleHistory>(
            $"/api/curriculum-imports/{receipt.Id}/history");
        Assert.NotNull(history);
        Assert.Equal(receipt.Id, history.ImportId);
        Assert.Equal(receipt.Checksum, history.PackageChecksum);
        Assert.Equal(CurriculumStatus.Draft, history.CurrentStatus);
        Assert.Equal(
            [
                "curriculum.uploaded",
                "curriculum.scan-completed",
                "curriculum.validation-started",
                "curriculum.retry-requested",
                "curriculum.validation-retried",
                "curriculum.validation-completed",
                "curriculum.draft-imported"
            ],
            history.Entries.Select(entry => entry.Action));
        Assert.True(history.Entries.Select(entry => entry.Id).SequenceEqual(
            history.Entries.Select(entry => entry.Id).Order()));
        Assert.All(history.Entries, entry =>
        {
            Assert.Equal(receipt.CorrelationId, entry.CorrelationId);
            Assert.Equal(receipt.Checksum, entry.PackageChecksum);
            Assert.Equal("1.0.0", entry.PackageVersion);
            Assert.False(string.IsNullOrWhiteSpace(entry.LifecycleStatus));
        });
        Assert.Equal(
            1L,
            await CountAsync(
                factory.DatabasePath,
                "SELECT COUNT(*) FROM CurriculumImports"));
    }

    [Fact]
    public async Task LifecycleHistoryIsTenantScopedAndAuditorAuthorized()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);
        await WaitForDraftAsync(client, receipt.Id);

        SetPersona(client, "auditor");
        var response = await client.GetAsync(
            $"/api/curriculum-imports/{receipt.Id}/history");
        response.EnsureSuccessStatusCode();
        var history = await response.Content.ReadFromJsonAsync<LifecycleHistory>();
        Assert.NotNull(history);
        Assert.All(history.Entries, entry =>
            Assert.Equal(receipt.CorrelationId, entry.CorrelationId));

        await using var scope = factory.Services.CreateAsyncScope();
        var store = scope.ServiceProvider.GetRequiredService<ICurriculumStore>();
        var crossTenant = await store.GetLifecycleAuditAsync(
            "other-tenant",
            receipt.Id,
            CancellationToken.None);
        Assert.Empty(crossTenant);
    }

    private static async Task<ImportReceipt> UploadAsync(HttpClient client)
    {
        var json = await File.ReadAllTextAsync(GetFixturePath());
        SetPersona(client, "author");
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "lifecycle-operations.json");
        var response = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ImportReceipt>())!;
    }

    private static async Task WaitForDraftAsync(HttpClient client, Guid id)
    {
        SetPersona(client, "author");
        for (var attempt = 0; attempt < 50; attempt++)
        {
            var status = await client.GetFromJsonAsync<ImportStatus>(
                $"/api/curriculum-imports/{id}");
            if (status?.Status == CurriculumStatus.Draft)
            {
                return;
            }

            await Task.Delay(50);
        }

        throw new TimeoutException("Curriculum import did not reach Draft.");
    }

    private static async Task MakeValidationStaleAsync(string databasePath, Guid id)
    {
        await using var connection = new SqliteConnection($"Data Source={databasePath}");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText =
            "UPDATE CurriculumImports SET ProcessingStartedAt = $startedAt WHERE Id = $id";
        command.Parameters.AddWithValue(
            "$startedAt",
            DateTimeOffset.UtcNow.Subtract(CurriculumWorkflow.StaleValidationThreshold)
                .Subtract(TimeSpan.FromMinutes(1)));
        command.Parameters.AddWithValue("$id", id);
        Assert.Equal(1, await command.ExecuteNonQueryAsync());
    }

    private static async Task<long> CountAsync(string databasePath, string sql)
    {
        await using var connection = new SqliteConnection($"Data Source={databasePath}");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        return (long)(await command.ExecuteScalarAsync())!;
    }

    private static void SetPersona(HttpClient client, string persona)
    {
        client.DefaultRequestHeaders.Remove("X-RepoFluent-Dev-User");
        client.DefaultRequestHeaders.Add("X-RepoFluent-Dev-User", persona);
    }

    private static string GetFixturePath()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, ".git")))
        {
            directory = directory.Parent;
        }

        return Path.Combine(
            directory?.FullName
                ?? throw new DirectoryNotFoundException("Repository root was not found."),
            "contracts",
            "curriculum",
            "0.1.0",
            "fixtures",
            "order-processing.json");
    }
}
