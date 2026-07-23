using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepoFluent.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCurriculumToLearning : Migration
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
    }
}
