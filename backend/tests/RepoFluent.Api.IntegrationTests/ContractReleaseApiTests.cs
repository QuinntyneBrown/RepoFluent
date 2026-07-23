using System.Net;
using System.Net.Http.Json;
using RepoFluent.Application;

namespace RepoFluent.Api.IntegrationTests;

public sealed class ContractReleaseApiTests
{
    [Fact]
    public async Task PublishedReleaseAndArtifactsArePublicAndChecksummed()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();

        var release = await client.GetFromJsonAsync<ContractReleaseView>(
            "/api/contracts/curriculum/releases/0.1.0");

        Assert.NotNull(release);
        Assert.Equal("0.1.0", release.Version);
        Assert.Matches("^sha256:[a-f0-9]{64}$", release.ReleaseChecksum);
        Assert.Equal(8, release.Artifacts.Count);
        Assert.Equal(10, release.FixtureSummary.Total);

        var schema = await client.GetAsync(
            "/api/contracts/curriculum/releases/0.1.0/artifacts/curriculum.schema.json");
        schema.EnsureSuccessStatusCode();
        Assert.Equal("application/schema+json", schema.Content.Headers.ContentType?.MediaType);
        Assert.Contains(
            "RepoFluent Curriculum Package 0.1.0",
            await schema.Content.ReadAsStringAsync(),
            StringComparison.Ordinal);
    }

    [Fact]
    public async Task UnsupportedReleaseReturnsAStableCompatibilityCode()
    {
        using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/contracts/curriculum/releases/1.0.0");
        var problem = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.NotNull(problem);
        Assert.Contains("CIC_CONTRACT_VERSION_UNSUPPORTED", problem["code"].ToString());
    }
}
