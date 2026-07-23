using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RepoFluent.Infrastructure.Migrations;

[DbContext(typeof(RepoFluentDbContext))]
[Migration("20260723205000_AddDraftImportIdempotency")]
public sealed class AddDraftImportIdempotency : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "ValidationAttemptCount",
            table: "CurriculumImports",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateIndex(
            name: "IX_CurriculumImports_TenantId_PackageId_PackageVersion",
            table: "CurriculumImports",
            columns: ["TenantId", "PackageId", "PackageVersion"],
            unique: true,
            filter: "\"PackageId\" <> '' AND \"PackageVersion\" <> ''");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_CurriculumImports_TenantId_PackageId_PackageVersion",
            table: "CurriculumImports");

        migrationBuilder.DropColumn(
            name: "ValidationAttemptCount",
            table: "CurriculumImports");
    }
}
