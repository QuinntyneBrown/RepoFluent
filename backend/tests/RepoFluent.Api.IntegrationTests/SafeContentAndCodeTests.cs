using System.Text.Json.Nodes;
using RepoFluent.Application;

namespace RepoFluent.Api.IntegrationTests;

public sealed class SafeContentAndCodeTests
{
    [Fact]
    public async Task AllowListedBlocksAndRevisionBoundTourValidateTogether()
    {
        var package = await ReadPackageAsync();
        package["courses"]![0]!["modules"]![0]!["lessons"]![0]!["blocks"] =
            JsonNode.Parse(
                """
                [
                  {
                    "type": "prose",
                    "text": "Structured explanation remains inert."
                  },
                  {
                    "type": "callout",
                    "tone": "information",
                    "title": "Architecture note",
                    "text": "Persistence creates the durable handoff."
                  },
                  {
                    "type": "diagram",
                    "title": "Order submission flow",
                    "description": "Checkout calls the API before durable processing begins.",
                    "alternativeText": "Checkout flows to the API and then processing.",
                    "labels": ["Checkout", "Order API", "Processing"]
                  },
                  {
                    "type": "codeReference",
                    "repositoryId": "order-service",
                    "path": "src/Order.Api/Controllers/OrderController.cs",
                    "branch": "main",
                    "commit": "8f24c1a",
                    "language": "csharp",
                    "startLine": 53,
                    "endLine": 54,
                    "symbol": "OrderController.Create",
                    "excerpt": "await bus.Publish(new OrderSubmitted(order.Id));",
                    "contentClassification": "internal",
                    "explanation": "The controller publishes after persistence.",
                    "provenance": "Captured from the declared snapshot."
                  },
                  {
                    "type": "codeTour",
                    "title": "Checkout to durable order",
                    "steps": [
                      {
                        "order": 1,
                        "title": "Submit checkout",
                        "guidance": "Start with the Angular command.",
                        "repositoryId": "storefront",
                        "path": "src/app/checkout/checkout.service.ts",
                        "branch": "release/checkout",
                        "commit": "91be440",
                        "language": "typescript",
                        "startLine": 24,
                        "endLine": 38,
                        "symbol": "CheckoutService.submit",
                        "excerpt": "const ids = new Array<string>();",
                        "contentClassification": "internal",
                        "provenance": "Captured from the declared snapshot."
                      },
                      {
                        "order": 2,
                        "title": "Publish the handoff",
                        "guidance": "Continue at the durable boundary.",
                        "repositoryId": "order-service",
                        "path": "src/Order.Api/Controllers/OrderController.cs",
                        "branch": "main",
                        "commit": "8f24c1a",
                        "language": "csharp",
                        "startLine": 42,
                        "endLine": 57,
                        "symbol": "OrderController.Create",
                        "excerpt": "await bus.Publish(new OrderSubmitted(order.Id));",
                        "contentClassification": "internal",
                        "provenance": "Captured from the declared snapshot."
                      }
                    ]
                  },
                  {
                    "type": "example",
                    "title": "Worked example",
                    "text": "Persist first, publish second."
                  },
                  {
                    "type": "glossaryLink",
                    "term": "Durable order",
                    "definition": "An order committed before processing begins."
                  },
                  {
                    "type": "knowledgeCheck",
                    "prompt": "Which boundary creates retry safety?",
                    "assessmentId": "order-workflow-checkpoint"
                  }
                ]
                """);

        var (validatedPackage, issues) = PackageValidator.Validate(package.ToJsonString());

        Assert.NotNull(validatedPackage);
        Assert.DoesNotContain(issues, issue => issue.IsBlocking);
        Assert.Equal(
            8,
            validatedPackage.Courses[0].Modules[0].Lessons[0].Blocks.Count);
        Assert.Equal(
            2,
            validatedPackage.Courses[0].Modules[0].Lessons[0].Blocks[4].Steps?.Count);
    }

    [Fact]
    public async Task ActiveAndRemoteContentReturnSafeExactPathIssues()
    {
        var active = await ReadPackageAsync();
        active["courses"]![0]!["modules"]![0]!["lessons"]![0]!["blocks"]![1]!["text"] =
            """<script>window.location = "https://untrusted.example"</script>""";

        var (_, activeIssues) = PackageValidator.Validate(active.ToJsonString());
        var activeIssue = Assert.Single(
            activeIssues,
            issue => issue.Code == "CIC_ACTIVE_CONTENT");
        Assert.Equal(
            "/courses/0/modules/0/lessons/0/blocks/1/text",
            activeIssue.Path);
        Assert.DoesNotContain("untrusted.example", activeIssue.Message, StringComparison.Ordinal);

        var remote = await ReadPackageAsync();
        remote["courses"]![0]!["modules"]![0]!["lessons"]![0]!["blocks"]![1]!["resourceUrl"] =
            "https://untrusted.example/callout.js";

        var (_, remoteIssues) = PackageValidator.Validate(remote.ToJsonString());
        var remoteIssue = Assert.Single(
            remoteIssues,
            issue => issue.Code == "CIC_UNDECLARED_RESOURCE");
        Assert.Equal(
            "/courses/0/modules/0/lessons/0/blocks/1/resourceUrl",
            remoteIssue.Path);
        Assert.DoesNotContain("untrusted.example", remoteIssue.Message, StringComparison.Ordinal);
    }

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
