using System.Text.Json.Nodes;
using RepoFluent.Application;

namespace RepoFluent.Api.IntegrationTests;

public sealed class ContractExtensionTests
{
    [Fact]
    public async Task UnsupportedNoncriticalExtensionWarnsAndPreservesCorePackage()
    {
        var package = await ReadPackageAsync();

        var (validatedPackage, issues) = PackageValidator.Validate(package.ToJsonString());

        Assert.NotNull(validatedPackage);
        Assert.Equal("Order Processing Foundations", validatedPackage.Title);
        Assert.Equal("com.acme.learning.insights", validatedPackage.Extensions?[0].Namespace);
        var warning = Assert.Single(issues, issue => issue.Code == "CIC_EXTENSION_IGNORED");
        Assert.Equal("warning", warning.Severity);
        Assert.False(warning.IsBlocking);
        Assert.Equal("/extensions/0/namespace", warning.Path);
    }

    [Fact]
    public async Task CriticalAndCoreRedefiningExtensionsBlockExactPaths()
    {
        var critical = await ReadPackageAsync();
        critical["extensions"]![0]!["critical"] = true;

        var (_, criticalIssues) = PackageValidator.Validate(critical.ToJsonString());
        var criticalIssue = Assert.Single(
            criticalIssues,
            issue => issue.Code == "CIC_UNSUPPORTED_CRITICAL_EXTENSION");
        Assert.True(criticalIssue.IsBlocking);
        Assert.Equal("/extensions/0/namespace", criticalIssue.Path);

        var redefinition = await ReadPackageAsync();
        redefinition["extensions"]![0]!["data"]!["title"] = "Replacement core title";

        var (_, redefinitionIssues) = PackageValidator.Validate(redefinition.ToJsonString());
        var redefinitionIssue = Assert.Single(
            redefinitionIssues,
            issue => issue.Code == "CIC_EXTENSION_REDEFINES_CORE");
        Assert.True(redefinitionIssue.IsBlocking);
        Assert.Equal("/extensions/0/data/title", redefinitionIssue.Path);
    }

    [Fact]
    public async Task InvalidExtensionEnvelopeReportsStableCodesWithoutIgnoredWarning()
    {
        var package = await ReadPackageAsync();
        package["extensions"]![0]!["namespace"] = "com.acme.invalid-";
        package["extensions"]![0]!["version"] = "01.2.0";
        package["extensions"]![0]!["data"] = new JsonObject();

        var (_, issues) = PackageValidator.Validate(package.ToJsonString());

        Assert.Contains(
            issues,
            issue => issue.Code == "CIC_INVALID_EXTENSION_NAMESPACE"
                && issue.Path == "/extensions/0/namespace");
        Assert.Contains(
            issues,
            issue => issue.Code == "CIC_INVALID_EXTENSION_VERSION"
                && issue.Path == "/extensions/0/version");
        Assert.Contains(
            issues,
            issue => issue.Code == "CIC_INVALID_EXTENSION_DATA"
                && issue.Path == "/extensions/0/data");
        Assert.DoesNotContain(issues, issue => issue.Code == "CIC_EXTENSION_IGNORED");
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
