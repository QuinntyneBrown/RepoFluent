using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RepoFluent.Infrastructure.Migrations;

[DbContext(typeof(RepoFluentDbContext))]
[Migration("20260723223000_AddReviewDecisionEvidence")]
public sealed class AddReviewDecisionEvidence : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ReviewDecisionJson",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ReviewDecisionJson",
            table: "CurriculumImports");
    }
}
