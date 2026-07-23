using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.Data.Sqlite;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Api.IntegrationTests;

public sealed class CurriculumVersionGovernanceTests
{
    [Fact]
    public async Task ComparisonClassifiesSemanticImpactWithoutOverstatingPunctuation()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var baseline = await UploadApproveAndPublishAsync(
            client,
            CreateGovernedPackageJson("1.0.0", false));
        var target = await UploadApproveAndPublishAsync(
            client,
            CreateGovernedPackageJson("2.0.0", true));
        SetPersona(client, "reviewer");

        var comparison = await client.GetFromJsonAsync<VersionComparison>(
            $"/api/curriculum-drafts/{target.ImportId}/comparisons/{baseline.VersionId}");

        Assert.NotNull(comparison);
        Assert.Equal("1.0.0", comparison.BaseVersion);
        Assert.Equal("2.0.0", comparison.TargetVersion);
        Assert.Contains(comparison.Changes, change => change.Classification == "Source changed");
        Assert.Contains(comparison.Changes, change => change.Classification == "Assessment changed");
        Assert.Contains(comparison.Changes, change => change.Classification == "Reordered");
        Assert.Contains(comparison.Changes, change => change.Classification == "Removed");
        Assert.Contains(
            comparison.Changes,
            change => change.Classification == "Presentational"
                && !change.LearnerRefreshRequired);
        Assert.Contains("trace-order", comparison.AffectedObjectiveIds);
        Assert.True(comparison.LearnerRefreshRequired);
        Assert.Equal(
            1L,
            await CountAsync(
                factory.DatabasePath,
                "SELECT COUNT(*) FROM AuditEvents WHERE Action = 'curriculum.version-comparison-viewed'"));
    }

    [Fact]
    public async Task RetirementBlocksNewAssignmentsAndRetainsAssignedLearning()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        var publication = await UploadApproveAndPublishAsync(
            client,
            CreateGovernedPackageJson("3.0.0", false));
        SetPersona(client, "administrator");
        var assignmentResponse = await client.PostAsJsonAsync(
            "/api/assignments",
            new AssignmentRequest(publication.VersionId, "learner", true));
        Assert.Equal(HttpStatusCode.Created, assignmentResponse.StatusCode);

        var retirementResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{publication.ImportId}/retire",
            new RetirementRequest("Superseded by a reviewed corrective version."));
        retirementResponse.EnsureSuccessStatusCode();
        var status = await retirementResponse.Content.ReadFromJsonAsync<ImportStatus>();
        Assert.NotNull(status);
        var retirement = Assert.IsType<Retirement>(status?.Retirement);

        Assert.Equal(CurriculumStatus.Retired, status.Status);
        Assert.Equal(publication.VersionId, retirement.VersionId);
        Assert.Equal("ContinueAccess", retirement.ExistingAssignmentPolicy);
        Assert.Equal("administrator", retirement.RetiredBy);
        var blockedAssignment = await client.PostAsJsonAsync(
            "/api/assignments",
            new AssignmentRequest(publication.VersionId, "learner", false));
        Assert.Equal(HttpStatusCode.NotFound, blockedAssignment.StatusCode);

        SetPersona(client, "learner");
        var assignments = await client.GetFromJsonAsync<IReadOnlyList<Assignment>>(
            "/api/learning/assignments");
        Assert.Contains(assignments!, item => item.PublishedVersionId == publication.VersionId);
        var retainedLesson = await client.GetAsync(
            $"/api/learning/versions/{publication.VersionId}/courses/order-processing-course/lessons/order-becomes-workflow");
        retainedLesson.EnsureSuccessStatusCode();
        Assert.Equal(
            1L,
            await CountAsync(
                factory.DatabasePath,
                "SELECT COUNT(*) FROM DomainEvents WHERE EventType = 'curriculum.version-retired'"));
        Assert.Equal(
            1L,
            await CountAsync(
                factory.DatabasePath,
                "SELECT COUNT(*) FROM AuditEvents WHERE Action = 'curriculum.retired'"));
        Assert.Equal(
            1L,
            await CountAsync(
                factory.DatabasePath,
                "SELECT COUNT(*) FROM CurriculumImports WHERE PackageId = 'version-governance-integration'"));
    }

    private static async Task<(Guid ImportId, Guid VersionId)> UploadApproveAndPublishAsync(
        HttpClient client,
        string json)
    {
        SetPersona(client, "author");
        using var content = new MultipartFormDataContent();
        using var package = new StringContent(json);
        package.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(package, "package", "version-governance.json");
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
                    "Reviewed exact warnings before version comparison."));
            acknowledgementResponse.EnsureSuccessStatusCode();
        }

        var approvalResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{draft.Id}/review-decisions",
            new ReviewRequest(
                "approved",
                draft.Checksum,
                report.IssueChecksum,
                "Approved exact version governance fixture."));
        approvalResponse.EnsureSuccessStatusCode();

        SetPersona(client, "administrator");
        var publicationResponse = await client.PostAsJsonAsync(
            $"/api/curriculum-drafts/{draft.Id}/publish",
            new { });
        publicationResponse.EnsureSuccessStatusCode();
        var published = await publicationResponse.Content.ReadFromJsonAsync<ImportStatus>();
        return (draft.Id, Assert.IsType<Publication>(published?.Publication).VersionId);
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

    private static string CreateGovernedPackageJson(string version, bool changeSemantics)
    {
        var root = JsonNode.Parse(File.ReadAllText(GetFixturePath()))!.AsObject();
        root["packageId"] = "version-governance-integration";
        root["version"] = version;
        root["title"] = changeSemantics
            ? "Order Processing Foundations!"
            : "Order Processing Foundations";
        var modules = root["courses"]![0]!["modules"]!.AsArray();
        var secondModule = modules[0]!.DeepClone().AsObject();
        secondModule["id"] = "operational-follow-through-module";
        secondModule["title"] = "Operational follow-through";
        secondModule["order"] = 2;
        secondModule["lessons"]![0]!["id"] = "operational-follow-through";
        secondModule["lessons"]![0]!["title"] = "Observe the workflow handoff";
        secondModule["lessons"]![0]!["objectives"]![0]!["id"] = "observe-handoff";
        secondModule["lessons"]![0]!["objectives"]![1]!["id"] = "explain-retry";
        modules.Add(secondModule);
        var items = root["assessments"]![0]!["pools"]![0]!["items"]!.AsArray();
        var secondItem = items[0]!.DeepClone().AsObject();
        secondItem["id"] = "durable-order-retry";
        secondItem["prompt"] = "What lets a retry observe the durable order?";
        items.Add(secondItem);
        if (!changeSemantics)
        {
            return root.ToJsonString();
        }

        var repository = root["sourceSnapshot"]!["repositories"]!.AsArray()
            .Single(node => node!["id"]!.GetValue<string>() == "order-service")!;
        repository["revision"] = "9a35d2b";
        repository["commit"] = "9a35d2b";
        foreach (var module in modules)
        {
            foreach (var lesson in module!["lessons"]!.AsArray())
            {
                foreach (var block in lesson!["blocks"]!.AsArray()
                             .Where(block =>
                                 block!["type"]!.GetValue<string>() == "codeReference"
                                 && block["repositoryId"]!.GetValue<string>() == "order-service"))
                {
                    block!["commit"] = "9a35d2b";
                }
            }
        }

        items.RemoveAt(items.Count - 1);
        var first = modules[0]!;
        var second = modules[1]!;
        modules.Clear();
        second["order"] = 1;
        first["order"] = 2;
        modules.Add(second);
        modules.Add(first);
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
