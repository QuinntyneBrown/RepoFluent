namespace RepoFluent.Application;

public sealed record LessonView(
    Guid PublishedVersionId,
    string CourseTitle,
    Lesson Lesson);
