namespace RepoFluent.Api;

public sealed record AuthoringKitReleaseView(
    string Kit,
    string KitVersion,
    string ContractVersion,
    string ValidatorVersion,
    string Status,
    DateTimeOffset PublishedAt,
    string Runtime,
    string ReleaseChecksum,
    AuthoringKitOfflinePolicyView Offline,
    IReadOnlyList<AuthoringKitArtifactView> Artifacts);
