namespace RepoFluent.Application;

public sealed record ArchitectureRelationship(
    string Id,
    string SourceId,
    string TargetId,
    string Type,
    string Description);
