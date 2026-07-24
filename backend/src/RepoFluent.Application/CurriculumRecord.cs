using RepoFluent.Domain;

namespace RepoFluent.Application;

public sealed class CurriculumRecord
{
    public required Guid Id { get; init; }

    public required string TenantId { get; init; }

    public required string AuthorId { get; init; }

    public required string RawPackage { get; init; }

    public required string Checksum { get; init; }

    public required string CorrelationId { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? ProcessingStartedAt { get; set; }

    public DateTimeOffset? ValidationCompletedAt { get; set; }

    public CurriculumStatus Status { get; set; }

    public string Title { get; set; } = "Pending curriculum";

    public string PackageId { get; set; } = string.Empty;

    public string PackageVersion { get; set; } = string.Empty;

    public int ValidationAttemptCount { get; set; }

    public string? ReviewerId { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public Guid? PublishedVersionId { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public IReadOnlyList<ValidationIssue> Issues { get; set; } = [];

    public ValidationReport? ValidationReport { get; set; }

    public WarningAcknowledgement? WarningAcknowledgement { get; set; }

    public ReviewDecision? ReviewDecision { get; set; }

    public Publication? Publication { get; set; }

    public Retirement? Retirement { get; set; }
}
