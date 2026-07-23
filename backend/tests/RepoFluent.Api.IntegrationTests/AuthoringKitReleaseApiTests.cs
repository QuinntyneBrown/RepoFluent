using System.Net.Http.Json;
using System.Security.Cryptography;

namespace RepoFluent.Api.IntegrationTests;

public sealed class AuthoringKitReleaseApiTests
{
    [Fact]
    public async Task ReleasePublishesCompleteChecksummedOfflineKit()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();

        var release = await client.GetFromJsonAsync<AuthoringKitReleaseView>(
            "/api/authoring-kits/releases/0.1.0");

        Assert.NotNull(release);
        Assert.Equal("repofluent-authoring-kit", release.Kit);
        Assert.Equal("0.1.0", release.KitVersion);
        Assert.Equal("0.1.0", release.ContractVersion);
        Assert.Equal("0.1.0", release.ValidatorVersion);
        Assert.True(release.Offline.Supported);
        Assert.False(release.Offline.ValidationRequiresNetwork);
        Assert.False(release.Offline.OptionalNetworkFeaturesEnabledByDefault);
        Assert.Matches("^sha256:[a-f0-9]{64}$", release.ReleaseChecksum);

        var requiredPaths = new[]
        {
            "AGENTS.md",
            "prompts/generate-curriculum.md",
            "skills/repofluent-authoring/SKILL.md",
            "contracts/curriculum.schema.json",
            "contracts/ICD.md",
            "examples/valid/order-processing.json",
            "examples/invalid/missing-title.json",
            "scripts/validate.mjs",
            "release-notes.md",
            "checksums.sha256"
        };
        Assert.All(
            requiredPaths,
            requiredPath => Assert.Contains(
                release.Artifacts,
                artifact => artifact.Path == requiredPath));

        var schemaArtifact = Assert.Single(
            release.Artifacts,
            artifact => artifact.Path == "contracts/curriculum.schema.json");
        var schema = await client.GetByteArrayAsync(schemaArtifact.DownloadUrl);
        Assert.Equal(
            schemaArtifact.Sha256,
            $"sha256:{Convert.ToHexStringLower(SHA256.HashData(schema))}");
    }
}
