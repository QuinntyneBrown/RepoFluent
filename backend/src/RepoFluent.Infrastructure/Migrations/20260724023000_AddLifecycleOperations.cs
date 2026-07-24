using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RepoFluent.Infrastructure.Migrations;

[DbContext(typeof(RepoFluentDbContext))]
[Migration("20260724023000_AddLifecycleOperations")]
public sealed class AddLifecycleOperations : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "LifecycleStatus",
            table: "AuditEvents",
            type: "TEXT",
            maxLength: 40,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PackageChecksum",
            table: "AuditEvents",
            type: "TEXT",
            maxLength: 80,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PackageVersion",
            table: "AuditEvents",
            type: "TEXT",
            maxLength: 40,
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "ProcessingStartedAt",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "ValidationCompletedAt",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "LifecycleStatus", table: "AuditEvents");
        migrationBuilder.DropColumn(name: "PackageChecksum", table: "AuditEvents");
        migrationBuilder.DropColumn(name: "PackageVersion", table: "AuditEvents");
        migrationBuilder.DropColumn(name: "ProcessingStartedAt", table: "CurriculumImports");
        migrationBuilder.DropColumn(name: "ValidationCompletedAt", table: "CurriculumImports");
    }
}
