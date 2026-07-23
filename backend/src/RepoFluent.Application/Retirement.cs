namespace RepoFluent.Application;

public sealed record Retirement(
    Guid VersionId,
    string TenantId,
    string RetiredBy,
    DateTimeOffset RetiredAt,
    string ExistingAssignmentPolicy,
    string Reason,
    Guid EventId);
