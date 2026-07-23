using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RepoFluent.Infrastructure.Migrations;

[DbContext(typeof(RepoFluentDbContext))]
[Migration("20260723193000_AddCurriculumValidationEvidence")]
public sealed class AddCurriculumValidationEvidence : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ValidationReportJson",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "WarningAcknowledgementJson",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ValidationReportJson",
            table: "CurriculumImports");

        migrationBuilder.DropColumn(
            name: "WarningAcknowledgementJson",
            table: "CurriculumImports");
    }
}
