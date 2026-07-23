namespace RepoFluent.Api;

public sealed record AuthoringKitArtifactView(
    string Name,
    string Path,
    string MediaType,
    string Sha256,
    string DownloadUrl);
