namespace RepoFluent.Application;

public sealed record Repository(
    string Id,
    string Name,
    string? Revision,
    string? RelativeRoot,
    string? Branch,
    string? Commit,
    IReadOnlyList<string>? Documents,
    DateTimeOffset? CapturedAt);
