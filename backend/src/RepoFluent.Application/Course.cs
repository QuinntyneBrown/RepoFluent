namespace RepoFluent.Application;

public sealed record Course(
    string Id,
    string Title,
    string Description,
    string Difficulty,
    int EstimatedMinutes,
    IReadOnlyList<string>? Audience,
    IReadOnlyList<string>? Tags,
    bool IsRequired,
    int Order,
    IReadOnlyList<string>? Prerequisites,
    IReadOnlyList<string>? CompletionRules,
    IReadOnlyList<LearningObjective> Objectives,
    IReadOnlyList<CourseModule> Modules);
