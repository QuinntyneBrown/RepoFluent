namespace RepoFluent.Application;

public sealed record WarningAcknowledgementRequest(
    string PackageChecksum,
    string IssueChecksum,
    string? Rationale);
