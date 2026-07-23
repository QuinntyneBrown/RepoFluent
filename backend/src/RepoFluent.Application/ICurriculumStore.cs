namespace RepoFluent.Application;

public interface ICurriculumStore
{
    Task AddImportAsync(
        CurriculumStoreModels.CurriculumRecord record,
        CancellationToken cancellationToken);

    Task<CurriculumStoreModels.CurriculumRecord?> GetImportAsync(
        string tenantId,
        Guid id,
        CancellationToken cancellationToken);

    Task<CurriculumStoreModels.CurriculumRecord?> ClaimReceivedAsync(
        CancellationToken cancellationToken);

    Task SaveImportAsync(
        CurriculumStoreModels.CurriculumRecord record,
        string auditAction,
        string actorId,
        CancellationToken cancellationToken);

    Task<bool> AssignmentExistsAsync(
        string tenantId,
        string learnerId,
        Guid publishedVersionId,
        CancellationToken cancellationToken);

    Task AddAssignmentAsync(
        CurriculumStoreModels.AssignmentRecord assignment,
        string actorId,
        string correlationId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<CurriculumStoreModels.AssignmentRecord>> GetAssignmentsAsync(
        string tenantId,
        string learnerId,
        CancellationToken cancellationToken);

    Task<CurriculumStoreModels.CurriculumRecord?> GetPublishedAsync(
        string tenantId,
        Guid publishedVersionId,
        CancellationToken cancellationToken);
}
