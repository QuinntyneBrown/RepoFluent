namespace RepoFluent.Application;

public sealed record Course(
    string Id,
    string Title,
    string Description,
    string Difficulty,
    int EstimatedMinutes,
    IReadOnlyList<string> Objectives,
    IReadOnlyList<CourseModule> Modules);
