namespace RepoFluent.Application;

public sealed record Block(
    string Type,
    string? Text,
    string? Tone,
    string? Title,
    string? RepositoryId,
    string? Path,
    string? Language,
    int? StartLine,
    int? EndLine,
    string? Symbol,
    string? Explanation);
