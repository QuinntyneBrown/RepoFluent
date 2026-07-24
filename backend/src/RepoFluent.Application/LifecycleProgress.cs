namespace RepoFluent.Application;

public sealed record LifecycleProgress(
    string ActiveStage,
    IReadOnlyList<string> CompletedStages,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ProcessingStartedAt,
    DateTimeOffset? ValidationCompletedAt,
    DateTimeOffset? ReviewedAt,
    DateTimeOffset? PublishedAt,
    DateTimeOffset? RetiredAt,
    bool IsStale,
    bool IsActionRequired,
    string? FailureCode,
    string? FailureDetail);
