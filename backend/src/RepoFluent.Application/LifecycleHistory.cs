using RepoFluent.Domain;

namespace RepoFluent.Application;

public sealed record LifecycleHistory(
    Guid ImportId,
    string PackageId,
    string PackageVersion,
    string PackageChecksum,
    CurriculumStatus CurrentStatus,
    string CorrelationId,
    IReadOnlyList<LifecycleAuditEntry> Entries);
