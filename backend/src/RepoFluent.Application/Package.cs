namespace RepoFluent.Application;

public sealed record Package(
    string ContractVersion,
    string PackageId,
    string Version,
    string Title,
    string Description,
    string Owner,
    string Locale,
    DateTimeOffset CreatedAt,
    string CreatedBy,
    SourceSnapshot SourceSnapshot,
    IReadOnlyList<CurriculumSystem> Systems,
    IReadOnlyList<ArchitectureRelationship> Relationships,
    IReadOnlyList<TerminologyDefinition> Terminology,
    IReadOnlyList<Course> Courses,
    IReadOnlyList<Assessment> Assessments)
{
    public EvidenceMetadata? Evidence { get; init; }

    public IReadOnlyList<ContractExtension>? Extensions { get; init; }
}
