namespace RepoFluent.Application;

public sealed record CourseModule(string Id, string Title, IReadOnlyList<Lesson> Lessons);
