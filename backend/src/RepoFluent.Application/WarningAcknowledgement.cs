namespace RepoFluent.Application;

public sealed record WarningAcknowledgement(
    string ActorId,
    DateTimeOffset AcknowledgedAt,
    string PackageChecksum,
    string IssueChecksum,
    string? Rationale);
