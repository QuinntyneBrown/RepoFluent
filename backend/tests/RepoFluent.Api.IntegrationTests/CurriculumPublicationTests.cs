using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.Data.Sqlite;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumPublicationTests
{
    [Fact]
    public async Task ConcurrentPublicationCommandsConvergeOnOneVersionAndEvent()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var draft = await UploadAndApproveAsync(
            client,
            CreatePackageJson("immutable-publication-concurrency", "1.0.0", "Concurrent Publication"));
        SetPersona(client, "administrator");

        var responses = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/curriculum-drafts/{draft.Id}/publish", new { }),
            client.PostAsJsonAsync($"/api/curriculum-drafts/{draft.Id}/publish", new { }));

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        var outcomes = await Task.WhenAll(
            responses.Select(response => response.Content.ReadFromJsonAsync<ImportStatus>()));
        var first = Assert.IsType<Publication>(outcomes[0]?.Publication);
        var second = Assert.IsType<Publication>(outcomes[1]?.Publication);

        Assert.Equal(first.VersionId, second.VersionId);
        Assert.Equal(first.EventId, second.EventId);
        Assert.Equal("ActiveForAssignment", first.AvailabilityPolicy);
        Assert.Equal(draft.Checksum, first.PackageChecksum);
        Assert.Equal("administrator", first.PublishedBy);
        Assert.Equal(1L, await CountAsync(
            factory.DatabasePath,
            "SELECT COUNT(*) FROM DomainEvents WHERE EventType = 'curriculum.version-published'"));
        Assert.Equal(1L, await CountAsync(
            factory.DatabasePath,
            "SELECT COUNT(*) FROM AuditEvents WHERE Action = 'curriculum.published'"));
    }

    [Fact]
    public async Task CorrectedVersionPreservesPublishedContentAndAssignmentsFromVersionOne()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        const string packageId = "immutable-publication-retention";
        var versionOneDraft = await UploadAndApproveAsync(
            client,
            CreatePackageJson(packageId, "1.0.0", "Order Processing Foundations"));
        var versionOne = await PublishAsync(client, versionOneDraft.Id);
        await AssignAsync(client, versionOne.VersionId);

        var versionTwoDraft = await UploadAndApproveAsync(
            client,
            CreatePackageJson(packageId, "2.0.0", "Order Processing Foundations Corrected"));
        var versionTwo = await PublishAsync(client, versionTwoDraft.Id);
        await AssignAsync(client, versionTwo.VersionId);

        SetPersona(client, "learner");
        var assignments = await client.GetFromJsonAsync<IReadOnlyList<Assignment>>(
            "/api/learning/assignments");
        Assert.Equal(2, assignments?.Count);
        Assert.Contains(assignments!, item =>
            item.PublishedVersionId == versionOne.VersionId
            && item.Title == "Order Processing Foundations");
        Assert.Contains(assignments!, item =>
            item.PublishedVersionId == versionTwo.VersionId
            && item.Title == "Order Processing Foundations Corrected");

        var lessonOne = await client.GetFromJsonAsync<LessonView>(
            $"/api/learning/versions/{versionOne.VersionId}/courses/order-processing-course/lessons/order-becomes-workflow");
        var lessonTwo = await client.GetFromJsonAsync<LessonView>(
            $"/api/learning/versions/{versionTwo.VersionId}/courses/order-processing-course/lessons/order-becomes-workflow");

        Assert.Equal("Order Processing Foundations", lessonOne?.CourseTitle);
        Assert.Equal("Order Processing Foundations Corrected", lessonTwo?.CourseTitle);
        Assert.Equal(versionOne.VersionId, lessonOne?.PublishedVersionId);
        Assert.Equal(versionTwo.VersionId, lessonTwo?.PublishedVersionId);
        Assert.NotEqual(versionOne.PackageChecksum, versionTwo.PackageChecksum);
    }

    private static async Task<ImportStatus> UploadAndApproveAsync(
        HttpClient client,
        string json)
    {
        SetPersona(client, "author");
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "immutable-publication.json");
        var uploadResponse = await client.PostAsync("/api/curriculum-imports", content);
        Assert.Equal(HttpStatusCode.Accepted, uploadResponse.StatusCode);
        var receipt = (await uploadResponse.Content.ReadFromJsonAsync<ImportReceipt>())!;
        var draft = await WaitForDraftAsync(client, receipt.Id);
        var report = Assert.IsType<ValidationReport>(draft.ValidationReport);

        SetPersona(client, "reviewer");
        if (report.WarningCount > 0)
        {
            var acknowledgementResponse = await client.PostAsJsonAsync(
                $"/api/curriculum-drafts/{draft.Id}/warning-acknowledgements",
                new WarningAcknowledgementRequest(
                    draft.Checksum,
                    report.IssueChecksum,
                    "Reviewed the exact warning set before publication."));
            acknowledgementResponse.EnsureSuccessStatusCode();
        }

        var approvalResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{draft.Id}/review-decisions",
            new ReviewRequest(
                "approved",
                draft.Checksum,
                report.IssueChecksum,
                "Approved exact content and validation evidence."));
        approvalResponse.EnsureSuccessStatusCode();
        return (await approvalResponse.Content.ReadFromJsonAsync<ImportStatus>())!;
    }

    private static async Task<Publication> PublishAsync(HttpClient client, Guid importId)
    {
        SetPersona(client, "administrator");
        var response = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{importId}/publish",
            new { });
        response.EnsureSuccessStatusCode();
        var status = await response.Content.ReadFromJsonAsync<ImportStatus>();
        return Assert.IsType<Publication>(status?.Publication);
    }

    private static async Task AssignAsync(HttpClient client, Guid versionId)
    {
        SetPersona(client, "administrator");
        var response = await client.PostAsJsonAsync(
            "/api/assignments",
            new AssignmentRequest(versionId, "learner", true));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
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

    private static string CreatePackageJson(
        string packageId,
        string version,
        string courseTitle)
    {
        var root = JsonNode.Parse(File.ReadAllText(GetFixturePath()))!.AsObject();
        root["packageId"] = packageId;
        root["version"] = version;
        root["title"] = courseTitle;
        root["courses"]![0]!["title"] = courseTitle;
        return root.ToJsonString();
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
