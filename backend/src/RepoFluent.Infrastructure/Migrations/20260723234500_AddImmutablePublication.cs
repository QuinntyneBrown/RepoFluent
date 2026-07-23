using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RepoFluent.Infrastructure.Migrations;

[DbContext(typeof(RepoFluentDbContext))]
[Migration("20260723234500_AddImmutablePublication")]
public sealed class AddImmutablePublication : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "PublicationJson",
            table: "CurriculumImports",
            type: "TEXT",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "DomainEvents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "TEXT", nullable: false),
                TenantId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                EventType = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                AggregateId = table.Column<Guid>(type: "TEXT", nullable: false),
                PayloadJson = table.Column<string>(type: "TEXT", nullable: false),
                OccurredAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_DomainEvents", item => item.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_DomainEvents_TenantId_EventType_OccurredAt",
            table: "DomainEvents",
            columns: ["TenantId", "EventType", "OccurredAt"]);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "DomainEvents");

        migrationBuilder.DropColumn(
            name: "PublicationJson",
            table: "CurriculumImports");
    }
}
