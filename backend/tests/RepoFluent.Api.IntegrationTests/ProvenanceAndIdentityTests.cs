using System.Text.Json.Nodes;
using RepoFluent.Application;

namespace RepoFluent.Api.IntegrationTests;

public sealed class ProvenanceAndIdentityTests
{
    [Fact]
    public async Task EvidenceResolvesAcrossPackageAndGeneratedElements()
    {
        var package = await ReadPackageAsync();
        var evidence = CreateEvidence();
        package["evidence"] = evidence.DeepClone();
        package["courses"]![0]!["objectives"]![0]!["evidence"] = evidence.DeepClone();
        package["courses"]![0]!["modules"]![0]!["lessons"]![0]!["blocks"]![0]!["evidence"] =
            evidence.DeepClone();
        package["assessments"]![0]!["pools"]![0]!["items"]![0]!["evidence"] =
            evidence.DeepClone();

        var (validatedPackage, issues) = PackageValidator.Validate(package.ToJsonString());

        Assert.NotNull(validatedPackage);
        Assert.DoesNotContain(issues, issue => issue.IsBlocking);
        Assert.Equal("high", validatedPackage.Evidence?.Confidence);
        Assert.Equal(
            "order-service",
            validatedPackage.Courses[0].Objectives[0].Evidence?.Citations?[0].SourceId);
    }

    [Fact]
    public async Task InvalidEvidenceIdentityAndCanonicalValuesReportEveryPath()
    {
        var invalidCitation = await ReadPackageAsync();
        invalidCitation["evidence"] = CreateEvidence();
        invalidCitation["evidence"]!["citations"]![0]!["sourceId"] = "missing-source";

        var (_, citationIssues) = PackageValidator.Validate(invalidCitation.ToJsonString());
        var citationIssue = Assert.Single(
            citationIssues,
            issue => issue.Code == "CIC_DANGLING_CITATION");
        Assert.Equal("/evidence/citations/0/sourceId", citationIssue.Path);

        var duplicate = await ReadPackageAsync();
        duplicate["courses"]![0]!["modules"]![0]!["id"] =
            duplicate["courses"]![0]!["id"]!.GetValue<string>();

        var (_, duplicateIssues) = PackageValidator.Validate(duplicate.ToJsonString());
        Assert.Equal(
            ["/courses/0/id", "/courses/0/modules/0/id"],
            duplicateIssues
                .Where(issue => issue.Code == "CIC_DUPLICATE_ID")
                .Select(issue => issue.Path)
                .Order(StringComparer.Ordinal)
                .ToArray());

        var nonCanonical = await ReadPackageAsync();
        nonCanonical["packageId"] = "Order_Processing";
        nonCanonical["locale"] = "en-ca";
        nonCanonical["createdAt"] = "2026-07-23T08:00:00-04:00";

        var (_, primitiveIssues) = PackageValidator.Validate(nonCanonical.ToJsonString());
        Assert.Contains(
            primitiveIssues,
            issue => issue.Code == "CIC_INVALID_ID" && issue.Path == "/packageId");
        Assert.Contains(
            primitiveIssues,
            issue => issue.Code == "CIC_UNSUPPORTED_LOCALE" && issue.Path == "/locale");
        Assert.Contains(
            primitiveIssues,
            issue => issue.Code == "CIC_NON_CANONICAL_DATE_TIME" && issue.Path == "/createdAt");
    }

    private static JsonNode CreateEvidence() =>
        JsonNode.Parse(
            """
            {
              "confidence": "high",
              "citations": [
                {
                  "sourceId": "order-service",
                  "document": "docs/orders.md",
                  "locator": "durable-handoff",
                  "evidenceType": "direct"
                }
              ],
              "assumptions": ["The snapshot describes the persistence boundary."],
              "omissions": ["Payment orchestration is outside this package."],
              "conflictingSources": ["The legacy runbook describes a different sequence."],
              "unresolvedQuestions": ["Which retry policy owns terminal failures?"]
            }
            """)
        ?? throw new InvalidOperationException("Evidence fixture is empty.");

    private static async Task<JsonNode> ReadPackageAsync() =>
        JsonNode.Parse(
            await File.ReadAllTextAsync(
                Path.Combine(
                    GetRepositoryRoot(),
                    "contracts",
                    "curriculum",
                    "0.1.0",
                    "fixtures",
                    "order-processing.json")))
        ?? throw new InvalidOperationException("Package fixture is empty.");

    private static string GetRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, ".git")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName
            ?? throw new DirectoryNotFoundException("Repository root was not found.");
    }
}
