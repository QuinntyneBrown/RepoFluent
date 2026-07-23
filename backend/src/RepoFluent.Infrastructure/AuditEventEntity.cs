namespace RepoFluent.Infrastructure;

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
