namespace RepoFluent.Application;

public sealed record AssessmentSelection(
    string Mode,
    int ItemCount,
    IReadOnlyList<string> PoolIds);
