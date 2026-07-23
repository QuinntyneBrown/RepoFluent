using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumIntakeAndValidationTests
{
    [Fact]
    public async Task ExecutableShapedUploadIsRejectedBeforeAnImportIsCreated()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        SetPersona(client, "author");
        using var content = new MultipartFormDataContent();
        using var package = new ByteArrayContent([0x4d, 0x5a, 0x90, 0x00]);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "curriculum.json");

        var response = await client.PostAsync("/api/curriculum-imports", content);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("CLI_UNSAFE_CONTENT", problem.GetProperty("title").GetString());
        Assert.Equal("CLI_UNSAFE_CONTENT", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task ExactWarningReportMustBeAcknowledgedBeforeApproval()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);
        var draft = await WaitForDraftAsync(client, receipt.Id);
        var report = Assert.IsType<ValidationReport>(draft.ValidationReport);

        Assert.Equal("0.1.0", report.ContractVersion);
        Assert.Equal("0.1.0", report.ValidatorVersion);
        Assert.Equal(draft.Checksum, report.PackageChecksum);
        Assert.Equal(11, report.CheckCategories.Count);
        Assert.Equal(0, report.ErrorCount);
        Assert.Equal(1, report.WarningCount);
        Assert.Matches("^sha256:[a-f0-9]{64}$", report.IssueChecksum);

        SetPersona(client, "reviewer");
        var gatedReview = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new ReviewRequest(
                "approved",
                draft.Checksum,
                report.IssueChecksum,
                "Reviewed the exact draft."));
        var gatedProblem = await gatedReview.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(HttpStatusCode.Conflict, gatedReview.StatusCode);
        Assert.Equal(
            "CLI_WARNING_ACKNOWLEDGEMENT_REQUIRED",
            gatedProblem.GetProperty("code").GetString());

        var staleAcknowledgement = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/warning-acknowledgements",
            new WarningAcknowledgementRequest(
                draft.Checksum,
                "sha256:stale",
                "Reviewed the warning."));
        var staleProblem = await staleAcknowledgement.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(HttpStatusCode.Conflict, staleAcknowledgement.StatusCode);
        Assert.Equal("CLI_STALE_WARNING_REPORT", staleProblem.GetProperty("code").GetString());

        var acknowledgementResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/warning-acknowledgements",
            new WarningAcknowledgementRequest(
                draft.Checksum,
                report.IssueChecksum,
                "Reviewed the exact warning."));
        acknowledgementResponse.EnsureSuccessStatusCode();
        var acknowledged = await acknowledgementResponse.Content.ReadFromJsonAsync<ImportStatus>();

        Assert.NotNull(acknowledged?.WarningAcknowledgement);
        Assert.Equal("reviewer", acknowledged.WarningAcknowledgement.ActorId);
        Assert.Equal(report.IssueChecksum, acknowledged.WarningAcknowledgement.IssueChecksum);
        Assert.Contains("review", acknowledged.AllowedActions);
        Assert.DoesNotContain("acknowledge-warnings", acknowledged.AllowedActions);
    }

    private static async Task<ImportReceipt> UploadAsync(HttpClient client)
    {
        SetPersona(client, "author");
        var json = await File.ReadAllTextAsync(GetFixturePath());
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "order-processing.json");
        var response = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ImportReceipt>())!;
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
