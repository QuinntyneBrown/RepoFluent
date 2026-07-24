using System.Data;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using RepoFluent.Application;
using RepoFluent.Domain;

namespace RepoFluent.Infrastructure;

public sealed class CurriculumStore(RepoFluentDbContext dbContext, TimeProvider timeProvider) : ICurriculumStore
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public async Task AddImportAsync(
        CurriculumRecord record,
        CancellationToken cancellationToken)
    {
        dbContext.CurriculumImports.Add(ToEntity(record));
        AddAudit(
            record.TenantId,
            record.AuthorId,
            "curriculum.uploaded",
            record.Id.ToString(),
            record.CorrelationId,
            record.Checksum,
            record.PackageVersion,
            record.Status.ToString());
        AddAudit(
            record.TenantId,
            "system",
            "curriculum.scan-completed",
            record.Id.ToString(),
            record.CorrelationId,
            record.Checksum,
            record.PackageVersion,
            record.Status.ToString());
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CurriculumRecord?> GetImportAsync(
        string tenantId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CurriculumImports
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.TenantId == tenantId && item.Id == id, cancellationToken);
        return entity is null ? null : ToRecord(entity);
    }

    public async Task<CurriculumRecord?> GetImportByPackageIdentityAsync(
        string tenantId,
        string packageId,
        string packageVersion,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CurriculumImports
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.TenantId == tenantId
                    && item.PackageId == packageId
                    && item.PackageVersion == packageVersion,
                cancellationToken);
        return entity is null ? null : ToRecord(entity);
    }

    public async Task<CurriculumRecord?> ClaimReceivedAsync(
        CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var entity = await dbContext.CurriculumImports
            .OrderBy(item => item.Id)
            .FirstOrDefaultAsync(
                item => item.Status == nameof(CurriculumStatus.Received),
                cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var lifecycle = CurriculumLifecycle.Rehydrate(
            entity.Id,
            entity.AuthorId,
            CurriculumStatus.Received,
            entity.ReviewerId,
            entity.PublishedVersionId);
        lifecycle.BeginValidation();
        entity.Status = lifecycle.Status.ToString();
        entity.ValidationAttemptCount++;
        entity.ProcessingStartedAt = timeProvider.GetUtcNow();
        AddAudit(
            entity.TenantId,
            "system",
            entity.ValidationAttemptCount == 1
                ? "curriculum.validation-started"
                : "curriculum.validation-retried",
            entity.Id.ToString(),
            entity.CorrelationId,
            entity.Checksum,
            entity.PackageVersion,
            entity.Status);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ToRecord(entity);
    }

    public async Task SaveImportAsync(
        CurriculumRecord record,
        string auditAction,
        string actorId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CurriculumImports.SingleAsync(
            item => item.TenantId == record.TenantId && item.Id == record.Id,
            cancellationToken);
        var reviewDecisionJson = record.ReviewDecision is null
            ? null
            : JsonSerializer.Serialize(record.ReviewDecision, SerializerOptions);
        var publicationJson = record.Publication is null
            ? null
            : JsonSerializer.Serialize(record.Publication, SerializerOptions);
        var retirementJson = record.Retirement is null
            ? null
            : JsonSerializer.Serialize(record.Retirement, SerializerOptions);
        if (reviewDecisionJson is not null
            && entity.ReviewDecisionJson is not null
            && !string.Equals(
                reviewDecisionJson,
                entity.ReviewDecisionJson,
                StringComparison.Ordinal))
        {
            throw new ConcurrentReviewDecisionException();
        }

        if (publicationJson is not null
            && entity.PublicationJson is not null
            && !string.Equals(
                publicationJson,
                entity.PublicationJson,
                StringComparison.Ordinal))
        {
            throw new ConcurrentPublicationException();
        }

        if (retirementJson is not null
            && entity.RetirementJson is not null
            && !string.Equals(
                retirementJson,
                entity.RetirementJson,
                StringComparison.Ordinal))
        {
            throw new ConcurrentRetirementException();
        }

        var isNewPublication = record.Publication is not null && entity.PublicationJson is null;
        var isNewRetirement = record.Retirement is not null && entity.RetirementJson is null;
        entity.Status = record.Status.ToString();
        entity.Title = record.Title;
        entity.PackageId = record.PackageId;
        entity.PackageVersion = record.PackageVersion;
        entity.ReviewerId = record.ReviewerId;
        entity.ReviewedAt = record.ReviewedAt;
        entity.PublishedVersionId = record.PublishedVersionId;
        entity.PublishedAt = record.PublishedAt;
        entity.ProcessingStartedAt = record.ProcessingStartedAt;
        entity.ValidationCompletedAt = record.ValidationCompletedAt;
        entity.ValidationIssuesJson = JsonSerializer.Serialize(record.Issues, SerializerOptions);
        entity.ValidationReportJson = record.ValidationReport is null
            ? null
            : JsonSerializer.Serialize(record.ValidationReport, SerializerOptions);
        entity.WarningAcknowledgementJson = record.WarningAcknowledgement is null
            ? null
            : JsonSerializer.Serialize(record.WarningAcknowledgement, SerializerOptions);
        entity.ReviewDecisionJson = reviewDecisionJson;
        entity.PublicationJson = publicationJson;
        entity.RetirementJson = retirementJson;
        if (isNewPublication)
        {
            dbContext.DomainEvents.Add(new DomainEventEntity
            {
                Id = record.Publication!.EventId,
                TenantId = record.TenantId,
                EventType = "curriculum.version-published",
                AggregateId = record.Id,
                PayloadJson = publicationJson!,
                OccurredAt = record.Publication.PublishedAt
            });
        }

        if (isNewRetirement)
        {
            dbContext.DomainEvents.Add(new DomainEventEntity
            {
                Id = record.Retirement!.EventId,
                TenantId = record.TenantId,
                EventType = "curriculum.version-retired",
                AggregateId = record.Id,
                PayloadJson = retirementJson!,
                OccurredAt = record.Retirement.RetiredAt
            });
        }

        AddAudit(
            record.TenantId,
            actorId,
            auditAction,
            record.Id.ToString(),
            record.CorrelationId,
            record.Checksum,
            record.PackageVersion,
            record.Status.ToString());
        if (string.Equals(
                auditAction,
                "curriculum.validation-completed",
                StringComparison.Ordinal)
            && record.Status == CurriculumStatus.Draft)
        {
            AddAudit(
                record.TenantId,
                "system",
                "curriculum.draft-imported",
                record.Id.ToString(),
                record.CorrelationId,
                record.Checksum,
                record.PackageVersion,
                record.Status.ToString());
        }
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            dbContext.ChangeTracker.Clear();
            var current = await dbContext.CurriculumImports
                .AsNoTracking()
                .SingleAsync(
                    item => item.TenantId == record.TenantId && item.Id == record.Id,
                    cancellationToken);
            if (retirementJson is not null
                && current.RetirementJson is not null
                && !string.Equals(
                    retirementJson,
                    current.RetirementJson,
                    StringComparison.Ordinal))
            {
                throw new ConcurrentRetirementException();
            }

            if (publicationJson is not null
                && current.PublicationJson is not null
                && !string.Equals(
                    publicationJson,
                    current.PublicationJson,
                    StringComparison.Ordinal))
            {
                throw new ConcurrentPublicationException();
            }

            if (reviewDecisionJson is not null
                && current.ReviewDecisionJson is not null
                && !string.Equals(
                    reviewDecisionJson,
                    current.ReviewDecisionJson,
                    StringComparison.Ordinal))
            {
                throw new ConcurrentReviewDecisionException();
            }

            throw;
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is SqliteException { SqliteErrorCode: 19 }
            && !string.IsNullOrEmpty(record.PackageId)
            && !string.IsNullOrEmpty(record.PackageVersion))
        {
            dbContext.ChangeTracker.Clear();
            throw new ConcurrentPackageIdentityException();
        }
    }

    public Task<bool> AssignmentExistsAsync(
        string tenantId,
        string learnerId,
        Guid publishedVersionId,
        CancellationToken cancellationToken) =>
        dbContext.Assignments.AnyAsync(
            item => item.TenantId == tenantId
                && item.LearnerId == learnerId
                && item.PublishedVersionId == publishedVersionId,
            cancellationToken);

    public async Task AddAssignmentAsync(
        AssignmentRecord assignment,
        string actorId,
        string correlationId,
        CancellationToken cancellationToken)
    {
        dbContext.Assignments.Add(new AssignmentEntity
        {
            Id = assignment.Id,
            TenantId = assignment.TenantId,
            LearnerId = assignment.LearnerId,
            PublishedVersionId = assignment.PublishedVersionId,
            IsRequired = assignment.IsRequired,
            CreatedAt = assignment.CreatedAt
        });
        AddAudit(assignment.TenantId, actorId, "assignment.created", assignment.Id.ToString(), correlationId);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AssignmentRecord>> GetAssignmentsAsync(
        string tenantId,
        string learnerId,
        CancellationToken cancellationToken) =>
        await dbContext.Assignments
            .AsNoTracking()
            .Where(item => item.TenantId == tenantId && item.LearnerId == learnerId)
            .OrderBy(item => item.Id)
            .Select(item => new AssignmentRecord
            {
                Id = item.Id,
                TenantId = item.TenantId,
                LearnerId = item.LearnerId,
                PublishedVersionId = item.PublishedVersionId,
                IsRequired = item.IsRequired,
                CreatedAt = item.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task<CurriculumRecord?> GetPublishedAsync(
        string tenantId,
        Guid publishedVersionId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CurriculumImports
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.TenantId == tenantId
                    && item.PublishedVersionId == publishedVersionId
                    && item.Status == nameof(CurriculumStatus.Published),
                cancellationToken);
        return entity is null ? null : ToRecord(entity);
    }

    public async Task<CurriculumRecord?> GetRetainedVersionAsync(
        string tenantId,
        Guid publishedVersionId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CurriculumImports
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.TenantId == tenantId
                    && item.PublishedVersionId == publishedVersionId
                    && (item.Status == nameof(CurriculumStatus.Published)
                        || item.Status == nameof(CurriculumStatus.Retired)),
                cancellationToken);
        return entity is null ? null : ToRecord(entity);
    }

    public async Task<IReadOnlyList<LifecycleAuditEntry>> GetLifecycleAuditAsync(
        string tenantId,
        Guid importId,
        CancellationToken cancellationToken) =>
        await dbContext.AuditEvents
            .AsNoTracking()
            .Where(item => item.TenantId == tenantId && item.TargetId == importId.ToString())
            .OrderBy(item => item.Id)
            .Select(item => new LifecycleAuditEntry(
                item.Id,
                item.Action,
                item.ActorId,
                item.OccurredAt,
                item.CorrelationId,
                item.PackageChecksum,
                item.PackageVersion,
                item.LifecycleStatus))
            .ToListAsync(cancellationToken);

    public async Task RecordAuditAsync(
        string tenantId,
        string actorId,
        string action,
        string targetId,
        string correlationId,
        CancellationToken cancellationToken)
    {
        CurriculumImportEntity? import = null;
        if (Guid.TryParse(targetId, out var importId))
        {
            import = await dbContext.CurriculumImports
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    item => item.TenantId == tenantId && item.Id == importId,
                    cancellationToken);
        }

        AddAudit(
            tenantId,
            actorId,
            action,
            targetId,
            correlationId,
            import?.Checksum,
            import?.PackageVersion,
            import?.Status);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private void AddAudit(
        string tenantId,
        string actorId,
        string action,
        string targetId,
        string correlationId,
        string? packageChecksum = null,
        string? packageVersion = null,
        string? lifecycleStatus = null) =>
        dbContext.AuditEvents.Add(new AuditEventEntity
        {
            TenantId = tenantId,
            ActorId = actorId,
            Action = action,
            TargetId = targetId,
            CorrelationId = correlationId,
            OccurredAt = timeProvider.GetUtcNow(),
            PackageChecksum = packageChecksum,
            PackageVersion = packageVersion,
            LifecycleStatus = lifecycleStatus
        });

    private static CurriculumImportEntity ToEntity(CurriculumRecord record) =>
        new()
        {
            Id = record.Id,
            TenantId = record.TenantId,
            AuthorId = record.AuthorId,
            RawPackage = record.RawPackage,
            Checksum = record.Checksum,
            CorrelationId = record.CorrelationId,
            Status = record.Status.ToString(),
            Title = record.Title,
            PackageId = record.PackageId,
            PackageVersion = record.PackageVersion,
            ValidationAttemptCount = record.ValidationAttemptCount,
            ValidationIssuesJson = "[]",
            CreatedAt = record.CreatedAt,
            ProcessingStartedAt = record.ProcessingStartedAt,
            ValidationCompletedAt = record.ValidationCompletedAt,
            ValidationReportJson = null,
            WarningAcknowledgementJson = null,
            ReviewDecisionJson = null,
            PublicationJson = null,
            RetirementJson = null
        };

    private static CurriculumRecord ToRecord(CurriculumImportEntity entity) =>
        new()
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            AuthorId = entity.AuthorId,
            RawPackage = entity.RawPackage,
            Checksum = entity.Checksum,
            CorrelationId = entity.CorrelationId,
            CreatedAt = entity.CreatedAt,
            ProcessingStartedAt = entity.ProcessingStartedAt,
            ValidationCompletedAt = entity.ValidationCompletedAt,
            Status = Enum.Parse<CurriculumStatus>(entity.Status),
            Title = entity.Title,
            PackageId = entity.PackageId,
            PackageVersion = entity.PackageVersion,
            ValidationAttemptCount = entity.ValidationAttemptCount,
            ReviewerId = entity.ReviewerId,
            ReviewedAt = entity.ReviewedAt,
            PublishedVersionId = entity.PublishedVersionId,
            PublishedAt = entity.PublishedAt,
            Issues = JsonSerializer.Deserialize<IReadOnlyList<ValidationIssue>>(
                entity.ValidationIssuesJson,
                SerializerOptions) ?? [],
            ValidationReport = entity.ValidationReportJson is null
                ? null
                : JsonSerializer.Deserialize<ValidationReport>(
                    entity.ValidationReportJson,
                    SerializerOptions),
            WarningAcknowledgement = entity.WarningAcknowledgementJson is null
                ? null
                : JsonSerializer.Deserialize<WarningAcknowledgement>(
                    entity.WarningAcknowledgementJson,
                    SerializerOptions),
            ReviewDecision = entity.ReviewDecisionJson is null
                ? null
                : JsonSerializer.Deserialize<ReviewDecision>(
                    entity.ReviewDecisionJson,
                    SerializerOptions),
            Publication = entity.PublicationJson is null
                ? null
                : JsonSerializer.Deserialize<Publication>(
                    entity.PublicationJson,
                    SerializerOptions),
            Retirement = entity.RetirementJson is null
                ? null
                : JsonSerializer.Deserialize<Retirement>(
                    entity.RetirementJson,
                    SerializerOptions)
        };
}
