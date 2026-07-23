namespace RepoFluent.Application;

public sealed record VersionChange(
    string Classification,
    string EntityType,
    string EntityId,
    string Description,
    IReadOnlyList<string> AffectedObjectiveIds,
    bool LearnerRefreshRequired);
