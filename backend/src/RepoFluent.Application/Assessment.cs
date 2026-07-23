namespace RepoFluent.Application;

public sealed record Assessment(
    string Id,
    string Title,
    string Purpose,
    AssessmentSelection Selection,
    int ThresholdPercent,
    int MaximumAttempts,
    int? TimeLimitMinutes,
    string FeedbackRelease,
    AssessmentMapping Mappings,
    IReadOnlyList<QuestionPool> Pools);
