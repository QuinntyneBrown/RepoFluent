namespace RepoFluent.Application;

public sealed record ValidationIssue(
    string Code,
    string Severity,
    bool IsBlocking,
    string Message,
    string Path);
