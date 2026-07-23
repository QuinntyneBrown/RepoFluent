namespace RepoFluent.Application;

public sealed record ContractArtifactView(
    string Name,
    string Path,
    string MediaType,
    string Sha256,
    string Url);
