namespace RepoFluent.Application;

public sealed record CodeTourStep(
    int Order,
    string Title,
    string Guidance,
    string RepositoryId,
    string Path,
    string? Branch,
    string? Commit,
    string Language,
    int StartLine,
    int EndLine,
    string Symbol,
    string Excerpt,
    string ContentClassification,
    string Provenance);
