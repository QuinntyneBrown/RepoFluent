namespace RepoFluent.Application;

public sealed record VersionComparison(
    Guid BaseVersionId,
    Guid TargetVersionId,
    string PackageId,
    string BaseVersion,
    string TargetVersion,
    IReadOnlyList<VersionChange> Changes,
    IReadOnlyList<string> AffectedObjectiveIds,
    bool LearnerRefreshRequired);
