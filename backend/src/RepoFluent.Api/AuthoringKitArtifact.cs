namespace RepoFluent.Api;

public sealed record AuthoringKitArtifact(
    string Path,
    string MediaType,
    byte[] Content);
