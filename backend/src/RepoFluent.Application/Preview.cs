namespace RepoFluent.Application;

public sealed record Preview(
    Guid ImportId,
    bool IsDraft,
    string PackageChecksum,
    ValidationReport ValidationReport,
    Package Package);
