using RepoFluent.Domain;

namespace RepoFluent.Application;

public sealed record ImportStatus(
    Guid Id,
    string Title,
    string Checksum,
    CurriculumStatus Status,
    IReadOnlyList<ValidationIssue> Issues,
    Guid? PublishedVersionId,
    IReadOnlyList<string> AllowedActions,
    string CorrelationId,
    ValidationReport? ValidationReport,
    WarningAcknowledgement? WarningAcknowledgement,
    string PackageId,
    string PackageVersion,
    int ValidationAttemptCount);
