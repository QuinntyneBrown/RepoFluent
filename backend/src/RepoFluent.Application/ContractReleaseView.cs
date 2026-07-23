namespace RepoFluent.Application;

public sealed record ContractReleaseView(
    string Contract,
    string Version,
    string Status,
    DateTimeOffset PublishedAt,
    string ChecksumAlgorithm,
    string ReleaseChecksum,
    IReadOnlyList<ContractArtifactView> Artifacts,
    ContractCompatibilityView Compatibility,
    ContractFixtureSummary FixtureSummary);
