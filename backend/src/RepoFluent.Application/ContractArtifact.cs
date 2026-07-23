namespace RepoFluent.Application;

public sealed record ContractArtifact(
    string Path,
    string MediaType,
    byte[] Content);
