using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RepoFluent.Infrastructure;

#nullable disable

namespace RepoFluent.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(RepoFluentDbContext))]
    [Migration("20260723005000_InitialCurriculumToLearning")]
    public class InitialCurriculumToLearning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    LearnerId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    PublishedVersionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    ActorId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Action = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TargetId = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    CorrelationId = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CurriculumImports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    AuthorId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    RawPackage = table.Column<string>(type: "TEXT", nullable: false),
                    Checksum = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    CorrelationId = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 240, nullable: false),
                    PackageId = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    PackageVersion = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    ValidationIssuesJson = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    ReviewerId = table.Column<string>(type: "TEXT", nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    PublishedVersionId = table.Column<Guid>(type: "TEXT", nullable: true),
                    PublishedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurriculumImports", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_TenantId_LearnerId_PublishedVersionId",
                table: "Assignments",
                columns: new[] { "TenantId", "LearnerId", "PublishedVersionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditEvents_TenantId_OccurredAt",
                table: "AuditEvents",
                columns: new[] { "TenantId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumImports_TenantId_Id",
                table: "CurriculumImports",
                columns: new[] { "TenantId", "Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumImports_TenantId_PublishedVersionId",
                table: "CurriculumImports",
                columns: new[] { "TenantId", "PublishedVersionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "AuditEvents");

            migrationBuilder.DropTable(
                name: "CurriculumImports");
        }

        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "10.0.10");

            modelBuilder.Entity("RepoFluent.Infrastructure.AssignmentEntity", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsRequired")
                        .HasColumnType("INTEGER");

                    b.Property<string>("LearnerId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.Property<Guid>("PublishedVersionId")
                        .HasColumnType("TEXT");

                    b.Property<string>("TenantId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("TenantId", "LearnerId", "PublishedVersionId")
                        .IsUnique();

                    b.ToTable("Assignments", (string)null);
                });

            modelBuilder.Entity("RepoFluent.Infrastructure.AuditEventEntity", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Action")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("ActorId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.Property<string>("CorrelationId")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("TEXT");

                    b.Property<DateTimeOffset>("OccurredAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("TargetId")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("TEXT");

                    b.Property<string>("TenantId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("TenantId", "OccurredAt");

                    b.ToTable("AuditEvents", (string)null);
                });

            modelBuilder.Entity("RepoFluent.Infrastructure.CurriculumImportEntity", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("AuthorId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.Property<string>("Checksum")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.Property<string>("CorrelationId")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("TEXT");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("PackageId")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("TEXT");

                    b.Property<string>("PackageVersion")
                        .IsRequired()
                        .HasMaxLength(40)
                        .HasColumnType("TEXT");

                    b.Property<DateTimeOffset?>("PublishedAt")
                        .HasColumnType("TEXT");

                    b.Property<Guid?>("PublishedVersionId")
                        .HasColumnType("TEXT");

                    b.Property<string>("RawPackage")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTimeOffset?>("ReviewedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("ReviewerId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(40)
                        .HasColumnType("TEXT");

                    b.Property<string>("TenantId")
                        .IsRequired()
                        .HasMaxLength(80)
                        .HasColumnType("TEXT");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(240)
                        .HasColumnType("TEXT");

                    b.Property<string>("ValidationIssuesJson")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("TenantId", "Id")
                        .IsUnique();

                    b.HasIndex("TenantId", "PublishedVersionId")
                        .IsUnique();

                    b.ToTable("CurriculumImports", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
