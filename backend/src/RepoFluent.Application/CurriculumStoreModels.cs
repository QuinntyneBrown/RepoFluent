using RepoFluent.Domain;

namespace RepoFluent.Application;

public static class CurriculumStoreModels
{
    public sealed class CurriculumRecord
    {
        public required Guid Id { get; init; }

        public required string TenantId { get; init; }

        public required string AuthorId { get; init; }

        public required string RawPackage { get; init; }

        public required string Checksum { get; init; }

        public required string CorrelationId { get; init; }

        public required DateTimeOffset CreatedAt { get; init; }

        public CurriculumStatus Status { get; set; }

        public string Title { get; set; } = "Pending curriculum";

        public string PackageId { get; set; } = string.Empty;

        public string PackageVersion { get; set; } = string.Empty;

        public string? ReviewerId { get; set; }

        public DateTimeOffset? ReviewedAt { get; set; }

        public Guid? PublishedVersionId { get; set; }

        public DateTimeOffset? PublishedAt { get; set; }

        public IReadOnlyList<CurriculumContracts.ValidationIssue> Issues { get; set; } = [];
    }

    public sealed class AssignmentRecord
    {
        public required Guid Id { get; init; }

        public required string TenantId { get; init; }

        public required string LearnerId { get; init; }

        public required Guid PublishedVersionId { get; init; }

        public required bool IsRequired { get; init; }

        public required DateTimeOffset CreatedAt { get; init; }
    }
}
