using System.Globalization;
using System.Text.Json.Nodes;
using RepoFluent.Application;

namespace RepoFluent.Api.IntegrationTests;

public sealed class ContractReleaseConformanceTests
{
    [Fact]
    public async Task EveryDeclaredFixtureProducesItsExpectedOutcome()
    {
        var releaseRoot = Path.Combine(GetRepositoryRoot(), "contracts", "curriculum", "0.1.0");
        var catalog = JsonNode.Parse(
            await File.ReadAllTextAsync(
                Path.Combine(releaseRoot, "fixtures", "conformance-catalog.json")))
            ?? throw new InvalidOperationException("Conformance catalog is empty.");

        foreach (var item in catalog["cases"]?.AsArray() ?? [])
        {
            var fixture = item ?? throw new InvalidOperationException("Fixture case is empty.");
            var identifier = fixture["id"]?.GetValue<string>() ?? "unknown";
            var fixtureName =
                fixture["fixture"]?.GetValue<string>()
                ?? fixture["baseFixture"]?.GetValue<string>()
                ?? throw new InvalidOperationException($"{identifier} has no source fixture.");
            var package = JsonNode.Parse(
                await File.ReadAllTextAsync(
                    Path.Combine(releaseRoot, "fixtures", fixtureName)))
                ?? throw new InvalidOperationException($"{identifier} source fixture is empty.");

            foreach (var mutation in fixture["mutations"]?.AsArray() ?? [])
            {
                ApplyMutation(
                    package,
                    mutation?.AsObject()
                    ?? throw new InvalidOperationException($"{identifier} has an empty mutation."));
            }

            var (validatedPackage, issues) = PackageValidator.Validate(package.ToJsonString());
            var expected = fixture["expected"]?.AsObject()
                ?? throw new InvalidOperationException($"{identifier} has no expected outcome.");
            var outcome = expected["outcome"]?.GetValue<string>();
            if (outcome == "success")
            {
                Assert.NotNull(validatedPackage);
                Assert.False(
                    issues.Any(issue => issue.IsBlocking),
                    $"{identifier} produced {string.Join(", ", issues.Select(issue => issue.Code))}");
                continue;
            }

            Assert.True(
                issues.Any(issue => issue.IsBlocking),
                $"{identifier} did not produce a blocking issue.");
            foreach (var code in expected["issueCodes"]?.AsArray() ?? [])
            {
                var expectedCode = code?.GetValue<string>();
                Assert.Contains(
                    issues,
                    issue => string.Equals(issue.Code, expectedCode, StringComparison.Ordinal));
            }
        }
    }

    private static void ApplyMutation(JsonNode root, JsonObject mutation)
    {
        var operation = mutation["operation"]?.GetValue<string>()
            ?? throw new InvalidOperationException("Mutation operation is absent.");
        var pointer = mutation["path"]?.GetValue<string>()
            ?? throw new InvalidOperationException("Mutation path is absent.");
        var segments = pointer.Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(segment => segment.Replace("~1", "/", StringComparison.Ordinal)
                .Replace("~0", "~", StringComparison.Ordinal))
            .ToArray();
        if (segments.Length == 0)
        {
            throw new InvalidOperationException("Root mutations are not supported.");
        }

        JsonNode current = root;
        foreach (var segment in segments[..^1])
        {
            current = current switch
            {
                JsonObject jsonObject => jsonObject[segment],
                JsonArray jsonArray => jsonArray[int.Parse(segment, CultureInfo.InvariantCulture)],
                _ => null
            } ?? throw new InvalidOperationException($"Mutation path {pointer} does not exist.");
        }

        var target = segments[^1];
        if (current is JsonObject parentObject)
        {
            if (operation == "remove")
            {
                parentObject.Remove(target);
            }
            else if (operation == "replace")
            {
                parentObject[target] = mutation["value"]?.DeepClone();
            }
            else
            {
                throw new InvalidOperationException($"Mutation operation {operation} is unsupported.");
            }
            return;
        }

        if (current is JsonArray parentArray)
        {
            var index = int.Parse(target, CultureInfo.InvariantCulture);
            if (operation == "remove")
            {
                parentArray.RemoveAt(index);
            }
            else if (operation == "replace")
            {
                parentArray[index] = mutation["value"]?.DeepClone();
            }
            else
            {
                throw new InvalidOperationException($"Mutation operation {operation} is unsupported.");
            }
            return;
        }

        throw new InvalidOperationException($"Mutation path {pointer} has no object or array parent.");
    }

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
