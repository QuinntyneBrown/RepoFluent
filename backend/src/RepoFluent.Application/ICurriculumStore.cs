namespace RepoFluent.Application;

public interface ICurriculumStore
{
    Task AddImportAsync(
        CurriculumRecord record,
        CancellationToken cancellationToken);

    Task<CurriculumRecord?> GetImportAsync(
        string tenantId,
        Guid id,
        CancellationToken cancellationToken);

    Task<CurriculumRecord?> GetImportByPackageIdentityAsync(
        string tenantId,
        string packageId,
        string packageVersion,
        CancellationToken cancellationToken);

    Task<CurriculumRecord?> ClaimReceivedAsync(
        CancellationToken cancellationToken);

    Task SaveImportAsync(
        CurriculumRecord record,
        string auditAction,
        string actorId,
        CancellationToken cancellationToken);

    Task<bool> AssignmentExistsAsync(
        string tenantId,
        string learnerId,
        Guid publishedVersionId,
        CancellationToken cancellationToken);

    Task AddAssignmentAsync(
        AssignmentRecord assignment,
        string actorId,
        string correlationId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<AssignmentRecord>> GetAssignmentsAsync(
        string tenantId,
        string learnerId,
        CancellationToken cancellationToken);

    Task<CurriculumRecord?> GetPublishedAsync(
        string tenantId,
        Guid publishedVersionId,
        CancellationToken cancellationToken);

    Task<CurriculumRecord?> GetRetainedVersionAsync(
        string tenantId,
        Guid publishedVersionId,
        CancellationToken cancellationToken);

    Task RecordAuditAsync(
        string tenantId,
        string actorId,
        string action,
        string targetId,
        string correlationId,
        CancellationToken cancellationToken);
}
