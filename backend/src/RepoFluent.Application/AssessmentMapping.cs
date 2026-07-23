namespace RepoFluent.Application;

public sealed record AssessmentMapping(
    IReadOnlyList<string> ObjectiveIds,
    IReadOnlyList<string> SystemIds,
    IReadOnlyList<string> SubsystemIds);
