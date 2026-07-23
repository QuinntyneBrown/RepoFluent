namespace RepoFluent.Infrastructure;

internal sealed class AssignmentEntity
{
    public Guid Id { get; set; }

    public required string TenantId { get; set; }

    public required string LearnerId { get; set; }

    public Guid PublishedVersionId { get; set; }

    public bool IsRequired { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
