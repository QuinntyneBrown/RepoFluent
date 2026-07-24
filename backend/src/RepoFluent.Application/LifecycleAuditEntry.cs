namespace RepoFluent.Application;

public sealed record LifecycleAuditEntry(
    long Id,
    string Action,
    string ActorId,
    DateTimeOffset OccurredAt,
    string CorrelationId,
    string? PackageChecksum,
    string? PackageVersion,
    string? LifecycleStatus);
