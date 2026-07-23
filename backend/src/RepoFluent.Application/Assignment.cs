namespace RepoFluent.Application;

public sealed record Assignment(
    Guid Id,
    Guid PublishedVersionId,
    string Title,
    string Description,
    bool IsRequired,
    string Status,
    string NextAction,
    string FirstCourseId);
