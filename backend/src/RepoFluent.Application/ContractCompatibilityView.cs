namespace RepoFluent.Application;

public sealed record ContractCompatibilityView(
    string SupportedVersionWindow,
    IReadOnlyDictionary<string, string> SemanticVersion,
    string BackwardCompatibilityStatus,
    string BackwardCompatibilityPolicy,
    string ForwardCompatibilityStatus,
    string ForwardCompatibilityPolicy,
    int DeprecationNoticeDays,
    string UnsupportedIssueCode,
    string UnsupportedMajorBehavior,
    string UnsupportedMinorBehavior,
    string MigrationResponsibility,
    IReadOnlyList<string> MigrationPreserves,
    string MigrationLossBehavior,
    string MigrationPolicy);
