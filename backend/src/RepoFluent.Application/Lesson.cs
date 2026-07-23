namespace RepoFluent.Application;

public sealed record Lesson(
    string Id,
    string Title,
    int EstimatedMinutes,
    string? Difficulty,
    IReadOnlyList<string>? Audience,
    IReadOnlyList<string>? Tags,
    bool IsRequired,
    int Order,
    IReadOnlyList<string>? Prerequisites,
    IReadOnlyList<string>? CompletionRules,
    IReadOnlyList<LearningObjective> Objectives,
    IReadOnlyList<Block> Blocks);
