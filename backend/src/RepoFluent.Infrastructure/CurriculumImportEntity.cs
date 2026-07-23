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

    public string? ValidationReportJson { get; set; }

    public string? WarningAcknowledgementJson { get; set; }
}
