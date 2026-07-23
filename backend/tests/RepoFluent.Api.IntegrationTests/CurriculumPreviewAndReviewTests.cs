using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumPreviewAndReviewTests
{
    [Fact]
    public async Task ReviewerPreviewsSafelyAndRecordsOneExactDecision()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);
        var draft = await WaitForDraftAsync(client, receipt.Id);
        var report = Assert.IsType<ValidationReport>(draft.ValidationReport);

        SetPersona(client, "learner");
        var assignmentsBefore = await client.GetFromJsonAsync<IReadOnlyList<Assignment>>(
            "/api/learning/assignments");
        Assert.Empty(assignmentsBefore!);
        var forbiddenPreview = await client.GetAsync(
            $"/api/curriculum-drafts/{receipt.Id}/preview");
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenPreview.StatusCode);

        SetPersona(client, "reviewer");
        var previewResponse = await client.GetAsync(
            $"/api/curriculum-drafts/{receipt.Id}/preview");
        previewResponse.EnsureSuccessStatusCode();
        var previewJson = await previewResponse.Content.ReadAsStringAsync();
        var preview = await previewResponse.Content.ReadFromJsonAsync<Preview>();

        Assert.NotNull(preview);
        Assert.True(preview.IsDraft);
        Assert.Equal(draft.Checksum, preview.PackageChecksum);
        Assert.Equal(report.IssueChecksum, preview.ValidationReport.IssueChecksum);
        Assert.Equal(draft.PackageVersion, preview.Package.Version);
        Assert.Contains(
            "\"visibility\":\"protected\",\"value\":null",
            previewJson,
            StringComparison.Ordinal);
        Assert.DoesNotContain(
            "\"visibility\":\"protected\",\"value\":\"",
            previewJson,
            StringComparison.Ordinal);

        var staleReportResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new ReviewRequest(
                "approved",
                draft.Checksum,
                "sha256:stale",
                "Reviewed the preview."));
        var staleReportProblem = await staleReportResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(HttpStatusCode.Conflict, staleReportResponse.StatusCode);
        Assert.Equal(
            "CLI_STALE_VALIDATION_REPORT",
            staleReportProblem.GetProperty("code").GetString());

        var missingRationaleResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new ReviewRequest("rejected", draft.Checksum, report.IssueChecksum, null));
        var missingRationaleProblem =
            await missingRationaleResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(HttpStatusCode.BadRequest, missingRationaleResponse.StatusCode);
        Assert.Equal(
            "CLI_REVIEW_RATIONALE_REQUIRED",
            missingRationaleProblem.GetProperty("code").GetString());

        var acknowledgementResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/warning-acknowledgements",
            new WarningAcknowledgementRequest(
                draft.Checksum,
                report.IssueChecksum,
                "Reviewed the exact warning set."));
        acknowledgementResponse.EnsureSuccessStatusCode();

        const string rationale = "Renderer, sources, validation report, and warnings reviewed.";
        var approvalResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new ReviewRequest("approved", draft.Checksum, report.IssueChecksum, rationale));
        approvalResponse.EnsureSuccessStatusCode();
        var approved = await approvalResponse.Content.ReadFromJsonAsync<ImportStatus>();
        var decision = Assert.IsType<ReviewDecision>(approved?.ReviewDecision);

        Assert.Equal("Approved", decision.Decision);
        Assert.Equal("reviewer", decision.ReviewerId);
        Assert.Equal("tenant-demo", decision.TenantId);
        Assert.Equal(draft.PackageId, decision.PackageId);
        Assert.Equal(draft.PackageVersion, decision.PackageVersion);
        Assert.Equal(draft.Checksum, decision.PackageChecksum);
        Assert.Equal(report.IssueChecksum, decision.ValidationIssueChecksum);
        Assert.Equal(rationale, decision.Rationale);
        Assert.NotNull(decision.WarningAcknowledgement);
        Assert.Equal(report.IssueChecksum, decision.WarningAcknowledgement.IssueChecksum);

        var secondDecisionResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new ReviewRequest(
                "rejected",
                draft.Checksum,
                report.IssueChecksum,
                "A later reviewer changed their mind."));
        var secondDecisionProblem =
            await secondDecisionResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(HttpStatusCode.Conflict, secondDecisionResponse.StatusCode);
        Assert.Equal(
            "CLI_REVIEW_DECISION_IMMUTABLE",
            secondDecisionProblem.GetProperty("code").GetString());

        SetPersona(client, "learner");
        var assignmentsAfter = await client.GetFromJsonAsync<IReadOnlyList<Assignment>>(
            "/api/learning/assignments");
        Assert.Empty(assignmentsAfter!);
    }

    [Fact]
    public async Task ConcurrentReviewersCannotReplaceTheWinningDecision()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);
        var draft = await WaitForDraftAsync(client, receipt.Id);
        var report = Assert.IsType<ValidationReport>(draft.ValidationReport);
        SetPersona(client, "reviewer");

        var acknowledgementResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/warning-acknowledgements",
            new WarningAcknowledgementRequest(
                draft.Checksum,
                report.IssueChecksum,
                "Reviewed the exact warning set."));
        acknowledgementResponse.EnsureSuccessStatusCode();

        var decisions = await Task.WhenAll(
            client.PostAsJsonAsync(
                $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
                new ReviewRequest(
                    "approved",
                    draft.Checksum,
                    report.IssueChecksum,
                    "Approval evidence checked.")),
            client.PostAsJsonAsync(
                $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
                new ReviewRequest(
                    "rejected",
                    draft.Checksum,
                    report.IssueChecksum,
                    "Rejection evidence checked.")));

        Assert.Single(decisions, response => response.StatusCode == HttpStatusCode.OK);
        var conflict = Assert.Single(
            decisions,
            response => response.StatusCode == HttpStatusCode.Conflict);
        var conflictProblem = await conflict.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(
            "CLI_REVIEW_DECISION_IMMUTABLE",
            conflictProblem.GetProperty("code").GetString());

        var stored = await client.GetFromJsonAsync<ImportStatus>(
            $"/api/curriculum-imports/{receipt.Id}");
        Assert.NotNull(stored?.ReviewDecision);
        Assert.True(stored.ReviewDecision.Decision is "Approved" or "Rejected");
    }

    private static async Task<ImportReceipt> UploadAsync(HttpClient client)
    {
        SetPersona(client, "author");
        var json = await File.ReadAllTextAsync(GetFixturePath());
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "preview-review.json");
        var response = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ImportReceipt>())!;
    }

    private static async Task<ImportStatus> WaitForDraftAsync(HttpClient client, Guid id)
    {
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
