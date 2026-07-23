using Microsoft.EntityFrameworkCore;

namespace RepoFluent.Infrastructure;

public sealed class RepoFluentDbContext(DbContextOptions<RepoFluentDbContext> options) : DbContext(options)
{
    internal DbSet<CurriculumImportEntity> CurriculumImports => Set<CurriculumImportEntity>();

    internal DbSet<AssignmentEntity> Assignments => Set<AssignmentEntity>();

    internal DbSet<AuditEventEntity> AuditEvents => Set<AuditEventEntity>();

    internal DbSet<DomainEventEntity> DomainEvents => Set<DomainEventEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CurriculumImportEntity>(entity =>
        {
            entity.ToTable("CurriculumImports");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.TenantId).HasMaxLength(80);
            entity.Property(item => item.AuthorId).HasMaxLength(80);
            entity.Property(item => item.Checksum).HasMaxLength(80);
            entity.Property(item => item.CorrelationId).HasMaxLength(120);
            entity.Property(item => item.Status).HasMaxLength(40);
            entity.Property(item => item.Title).HasMaxLength(240);
            entity.Property(item => item.PackageId).HasMaxLength(120);
            entity.Property(item => item.PackageVersion).HasMaxLength(40);
            entity.Property(item => item.ReviewDecisionJson).IsConcurrencyToken();
            entity.Property(item => item.PublicationJson).IsConcurrencyToken();
            entity.HasIndex(item => new { item.TenantId, item.Id }).IsUnique();
            entity.HasIndex(item => new { item.TenantId, item.PackageId, item.PackageVersion })
                .IsUnique()
                .HasFilter("\"PackageId\" <> '' AND \"PackageVersion\" <> ''");
            entity.HasIndex(item => new { item.TenantId, item.PublishedVersionId }).IsUnique();
        });

        modelBuilder.Entity<AssignmentEntity>(entity =>
        {
            entity.ToTable("Assignments");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.TenantId).HasMaxLength(80);
            entity.Property(item => item.LearnerId).HasMaxLength(80);
            entity.HasIndex(item => new { item.TenantId, item.LearnerId, item.PublishedVersionId }).IsUnique();
        });

        modelBuilder.Entity<AuditEventEntity>(entity =>
        {
            entity.ToTable("AuditEvents");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.TenantId).HasMaxLength(80);
            entity.Property(item => item.ActorId).HasMaxLength(80);
            entity.Property(item => item.Action).HasMaxLength(100);
            entity.Property(item => item.TargetId).HasMaxLength(120);
            entity.Property(item => item.CorrelationId).HasMaxLength(120);
            entity.HasIndex(item => new { item.TenantId, item.OccurredAt });
        });

        modelBuilder.Entity<DomainEventEntity>(entity =>
        {
            entity.ToTable("DomainEvents");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.TenantId).HasMaxLength(80);
            entity.Property(item => item.EventType).HasMaxLength(120);
            entity.HasIndex(item => new { item.TenantId, item.EventType, item.OccurredAt });
        });
    }
}
