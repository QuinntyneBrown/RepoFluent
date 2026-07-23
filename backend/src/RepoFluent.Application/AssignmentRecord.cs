namespace RepoFluent.Application;

public sealed class AssignmentRecord
{
    public required Guid Id { get; init; }

    public required string TenantId { get; init; }

    public required string LearnerId { get; init; }

    public required Guid PublishedVersionId { get; init; }

    public required bool IsRequired { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
