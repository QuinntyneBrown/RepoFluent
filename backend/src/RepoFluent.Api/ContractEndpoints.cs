namespace RepoFluent.Api;

public static class ContractEndpoints
{
    public static IEndpointRouteBuilder MapContractEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var releases = endpoints.MapGroup("/api/contracts/curriculum/releases");
        releases.MapGet("/{version}", GetRelease);
        releases.MapGet("/{version}/artifacts/{**artifactPath}", GetArtifact);
        return endpoints;
    }

    private static IResult GetRelease(string version, ContractReleaseCatalog catalog) =>
        Results.Ok(catalog.GetRelease(version));

    private static IResult GetArtifact(
        string version,
        string artifactPath,
        ContractReleaseCatalog catalog)
    {
        var artifact = catalog.GetArtifact(version, artifactPath);
        return Results.File(artifact.Content, artifact.MediaType);
    }
}
