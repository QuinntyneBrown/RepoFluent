namespace RepoFluent.Infrastructure;

internal sealed class DomainEventEntity
{
    public Guid Id { get; set; }

    public required string TenantId { get; set; }

    public required string EventType { get; set; }

    public Guid AggregateId { get; set; }

    public required string PayloadJson { get; set; }

    public DateTimeOffset OccurredAt { get; set; }
}
