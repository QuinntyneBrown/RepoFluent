using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumGoldenPathApiTests
{
    [Fact]
    public async Task ValidPackageRequiresDistinctReviewPublicationAndAssignmentRoles()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var receipt = await UploadAsync(client);
        var draft = await WaitForStatusAsync(client, receipt.Id, CurriculumStatus.Draft);

        SetPersona(client, "author");
        var selfReview = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new CurriculumContracts.ReviewRequest("approved", draft.Checksum));
        Assert.Equal(HttpStatusCode.Forbidden, selfReview.StatusCode);

        SetPersona(client, "reviewer");
        var staleReview = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new CurriculumContracts.ReviewRequest("approved", "sha256:stale"));
        Assert.Equal(HttpStatusCode.Conflict, staleReview.StatusCode);

        var approvedResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/review-decisions",
            new CurriculumContracts.ReviewRequest("approved", draft.Checksum));
        approvedResponse.EnsureSuccessStatusCode();

        SetPersona(client, "reviewer");
        var forbiddenPublish = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/publish",
            new { });
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenPublish.StatusCode);

        SetPersona(client, "administrator");
        var publishedResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{receipt.Id}/publish",
            new { });
        publishedResponse.EnsureSuccessStatusCode();
        var published = await publishedResponse.Content.ReadFromJsonAsync<CurriculumContracts.ImportStatus>();
        Assert.NotNull(published?.PublishedVersionId);

        var assignmentResponse = await client.PostAsJsonAsync(
            "/api/assignments",
            new CurriculumContracts.AssignmentRequest(published.PublishedVersionId.Value, "learner", true));
        Assert.Equal(HttpStatusCode.Created, assignmentResponse.StatusCode);

        SetPersona(client, "learner");
        var assignments = await client.GetFromJsonAsync<IReadOnlyList<CurriculumContracts.Assignment>>(
            "/api/learning/assignments");
        var assignment = Assert.Single(assignments!);
        Assert.True(assignment.IsRequired);
        Assert.Equal("Order Processing Foundations", assignment.Title);
    }

    [Fact]
    public async Task ForbiddenSourcePathReturnsAStableIssueAndNeverBecomesADraft()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var json = await File.ReadAllTextAsync(GetFixturePath());
        json = json.Replace(
            "src/Order.Api/Controllers/OrderController.cs",
            "C:\\\\Users\\\\author\\\\OrderController.cs",
            StringComparison.Ordinal);
        var receipt = await UploadAsync(client, json);

        var failed = await WaitForStatusAsync(client, receipt.Id, CurriculumStatus.ValidationFailed);

        var issue = Assert.Single(failed.Issues, item => item.Code == "CIC_FORBIDDEN_PATH");
        Assert.Equal("/courses/0/modules/0/lessons/0/blocks/2/path", issue.Path);
        Assert.True(issue.IsBlocking);
    }

    private static async Task<CurriculumContracts.ImportReceipt> UploadAsync(
        HttpClient client,
        string? json = null)
    {
        SetPersona(client, "author");
        json ??= await File.ReadAllTextAsync(GetFixturePath());
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "order-processing.json");
        var response = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<CurriculumContracts.ImportReceipt>())!;
    }

    private static async Task<CurriculumContracts.ImportStatus> WaitForStatusAsync(
        HttpClient client,
        Guid id,
        CurriculumStatus expected)
    {
        SetPersona(client, "author");
        for (var attempt = 0; attempt < 50; attempt++)
        {
            var status = await client.GetFromJsonAsync<CurriculumContracts.ImportStatus>(
                $"/api/curriculum-imports/{id}");
            if (status?.Status == expected)
            {
                return status;
            }

            await Task.Delay(50);
        }

        throw new TimeoutException($"Curriculum import did not reach {expected}.");
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
            directory?.FullName ?? throw new DirectoryNotFoundException("Repository root was not found."),
            "contracts",
            "curriculum",
            "0.1.0",
            "fixtures",
            "order-processing.json");
    }
}
