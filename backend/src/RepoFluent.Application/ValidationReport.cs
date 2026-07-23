namespace RepoFluent.Application;

public sealed record ValidationReport(
    string ValidatorVersion,
    string ContractVersion,
    string PackageChecksum,
    string IssueChecksum,
    IReadOnlyList<string> CheckCategories,
    int ErrorCount,
    int WarningCount,
    DateTimeOffset CompletedAt);
