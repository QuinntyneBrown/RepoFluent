namespace RepoFluent.Application;

public sealed record ReviewDecision(
    string ReviewerId,
    string TenantId,
    string PackageId,
    string PackageVersion,
    string PackageChecksum,
    string ValidationIssueChecksum,
    string Decision,
    DateTimeOffset DecidedAt,
    WarningAcknowledgement? WarningAcknowledgement,
    string? Rationale);
