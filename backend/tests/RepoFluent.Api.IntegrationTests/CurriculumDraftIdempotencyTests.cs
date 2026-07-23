using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumDraftIdempotencyTests
{
    [Fact]
    public async Task IdenticalReuploadReturnsTheExistingDraft()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var original = await UploadAsync(client);
        var draft = await WaitForDraftAsync(client, original.Id);

        var replay = await UploadAsync(client);

        Assert.False(original.IsReplay);
        Assert.True(replay.IsReplay);
        Assert.Equal(original.Id, replay.Id);
        Assert.Equal(original.Checksum, replay.Checksum);
        Assert.Equal("order-processing-foundations", draft.PackageId);
        Assert.Equal("1.0.0", draft.PackageVersion);
        Assert.Equal(1, draft.ValidationAttemptCount);
        Assert.NotEqual(draft.Id.ToString(), draft.PackageId);
    }

    [Fact]
    public async Task DifferentBytesForExistingIdentityAndVersionReturnConflict()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var original = await UploadAsync(client);
        await WaitForDraftAsync(client, original.Id);
        var json = await File.ReadAllTextAsync(GetFixturePath());
        var changed = json.Replace(
            "Learn how an Angular checkout becomes a durable .NET workflow.",
            "Learn how changed checkout content becomes a durable .NET workflow.",
            StringComparison.Ordinal);

        SetPersona(client, "author");
        using var content = CreateContent(changed);
        var response = await client.PostAsync("/api/curriculum-imports", content);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.Equal("CLI_PACKAGE_VERSION_CONFLICT", problem!["code"].ToString());
    }

    [Fact]
    public async Task InterruptedConversionCanRetryToOneCompleteDraft()
    {
        using var factory = new TestApplicationFactory(enableValidationWorker: false);
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var store = scope.ServiceProvider.GetRequiredService<ICurriculumStore>();
            var firstAttempt = await store.ClaimReceivedAsync(CancellationToken.None);
            Assert.Equal(receipt.Id, firstAttempt?.Id);
            Assert.Equal(1, firstAttempt?.ValidationAttemptCount);
            Assert.Equal(CurriculumStatus.Validating, firstAttempt?.Status);
        }

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var store = scope.ServiceProvider.GetRequiredService<ICurriculumStore>();
            var retry = await store.ClaimReceivedAsync(CancellationToken.None);
            Assert.Equal(receipt.Id, retry?.Id);
            Assert.Equal(2, retry?.ValidationAttemptCount);
            Assert.Equal(CurriculumStatus.Validating, retry?.Status);
        }

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var workflow = scope.ServiceProvider.GetRequiredService<CurriculumWorkflow>();
            await workflow.ValidateNextAsync(CancellationToken.None);
        }

        SetPersona(client, "author");
        var completed = await client.GetFromJsonAsync<ImportStatus>(
            $"/api/curriculum-imports/{receipt.Id}");
        Assert.Equal(CurriculumStatus.Draft, completed?.Status);
        Assert.Equal(3, completed?.ValidationAttemptCount);
        Assert.NotNull(completed?.ValidationReport);
    }

    private static async Task<ImportReceipt> UploadAsync(HttpClient client)
    {
        var json = await File.ReadAllTextAsync(GetFixturePath());
        SetPersona(client, "author");
        using var content = CreateContent(json);
        var response = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ImportReceipt>())!;
    }

    private static MultipartFormDataContent CreateContent(string json)
    {
        var content = new MultipartFormDataContent();
        var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "order-processing.json");
        return content;
    }

    private static async Task<ImportStatus> WaitForDraftAsync(HttpClient client, Guid id)
    {
        SetPersona(client, "author");
        for (var attempt = 0; attempt < 50; attempt++)
        {
            var status = await client.GetFromJsonAsync<ImportStatus>(
                $"/api/curriculum-imports/{id}");
            if (status?.Status == CurriculumStatus.Draft)
            {
                return status;
            }

            await Task.Delay(50);
        }

        throw new TimeoutException("Curriculum import did not reach Draft.");
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
