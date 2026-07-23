namespace RepoFluent.Infrastructure;

internal sealed class CurriculumImportEntity
{
    public Guid Id { get; set; }

    public required string TenantId { get; set; }

    public required string AuthorId { get; set; }

    public required string RawPackage { get; set; }

    public required string Checksum { get; set; }

    public required string CorrelationId { get; set; }

    public required string Status { get; set; }

    public required string Title { get; set; }

    public required string PackageId { get; set; }

    public required string PackageVersion { get; set; }

    public required string ValidationIssuesJson { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public string? ReviewerId { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public Guid? PublishedVersionId { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }
}

internal sealed class AssignmentEntity
{
    public Guid Id { get; set; }

    public required string TenantId { get; set; }

    public required string LearnerId { get; set; }

    public Guid PublishedVersionId { get; set; }

    public bool IsRequired { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

internal sealed class AuditEventEntity
{
    public long Id { get; set; }

    public required string TenantId { get; set; }

    public required string ActorId { get; set; }

    public required string Action { get; set; }

    public required string TargetId { get; set; }

    public required string CorrelationId { get; set; }

    public DateTimeOffset OccurredAt { get; set; }
}
