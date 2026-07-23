namespace RepoFluent.Application;

public sealed record Publication(
    Guid VersionId,
    string TenantId,
    Guid ImportId,
    string PackageId,
    string PackageVersion,
    string PackageChecksum,
    string AvailabilityPolicy,
    string PublishedBy,
    DateTimeOffset PublishedAt,
    Guid EventId);
