namespace RepoFluent.Application;

public sealed record CourseModule(
    string Id,
    string Title,
    int Order,
    IReadOnlyList<Lesson> Lessons);
