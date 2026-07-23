namespace RepoFluent.Application;

public sealed record Lesson(
    string Id,
    string Title,
    int EstimatedMinutes,
    IReadOnlyList<string> Objectives,
    IReadOnlyList<Block> Blocks);
