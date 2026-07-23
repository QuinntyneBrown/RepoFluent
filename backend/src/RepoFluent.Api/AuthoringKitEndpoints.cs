namespace RepoFluent.Api;

public static class AuthoringKitEndpoints
{
    public static IEndpointRouteBuilder MapAuthoringKitEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var releases = endpoints.MapGroup("/api/authoring-kits/releases");
        releases.MapGet("/{version}", GetRelease);
        releases.MapGet("/{version}/artifacts/{**artifactPath}", GetArtifact);
        return endpoints;
    }

    private static IResult GetRelease(
        string version,
        AuthoringKitReleaseCatalog catalog) =>
        Results.Ok(catalog.GetRelease(version));

    private static IResult GetArtifact(
        string version,
        string artifactPath,
        AuthoringKitReleaseCatalog catalog)
    {
        var artifact = catalog.GetArtifact(version, artifactPath);
        return Results.File(artifact.Content, artifact.MediaType);
    }
}
