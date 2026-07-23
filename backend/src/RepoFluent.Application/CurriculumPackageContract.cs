namespace RepoFluent.Application;

public static class CurriculumPackageContract
{
    public sealed record Package(
        string ContractVersion,
        string PackageId,
        string Version,
        string Title,
        string Description,
        string Owner,
        string Locale,
        SourceSnapshot SourceSnapshot,
        IReadOnlyList<Course> Courses);

    public sealed record SourceSnapshot(IReadOnlyList<Repository> Repositories);

    public sealed record Repository(string Id, string Name, string Revision);

    public sealed record Course(
        string Id,
        string Title,
        string Description,
        string Difficulty,
        int EstimatedMinutes,
        IReadOnlyList<string> Objectives,
        IReadOnlyList<CourseModule> Modules);

    public sealed record CourseModule(string Id, string Title, IReadOnlyList<Lesson> Lessons);

    public sealed record Lesson(
        string Id,
        string Title,
        int EstimatedMinutes,
        IReadOnlyList<string> Objectives,
        IReadOnlyList<Block> Blocks);

    public sealed record Block(
        string Type,
        string? Text,
        string? Tone,
        string? Title,
        string? RepositoryId,
        string? Path,
        string? Language,
        int? StartLine,
        int? EndLine,
        string? Symbol,
        string? Explanation);
}
