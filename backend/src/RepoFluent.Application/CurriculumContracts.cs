using RepoFluent.Domain;

namespace RepoFluent.Application;

public static class CurriculumContracts
{
    public sealed record ValidationIssue(
        string Code,
        string Severity,
        bool IsBlocking,
        string Message,
        string Path);

    public sealed record ImportReceipt(
        Guid Id,
        string Checksum,
        CurriculumStatus Status,
        string CorrelationId,
        string StatusUrl);

    public sealed record ImportStatus(
        Guid Id,
        string Title,
        string Checksum,
        CurriculumStatus Status,
        IReadOnlyList<ValidationIssue> Issues,
        Guid? PublishedVersionId,
        IReadOnlyList<string> AllowedActions,
        string CorrelationId);

    public sealed record Preview(Guid ImportId, bool IsDraft, CurriculumPackageContract.Package Package);

    public sealed record ReviewRequest(string Decision, string Checksum);

    public sealed record AssignmentRequest(Guid PublishedVersionId, string LearnerId, bool IsRequired);

    public sealed record Assignment(
        Guid Id,
        Guid PublishedVersionId,
        string Title,
        string Description,
        bool IsRequired,
        string Status,
        string NextAction,
        string FirstCourseId);

    public sealed record CourseView(Guid PublishedVersionId, CurriculumPackageContract.Course Course);

    public sealed record LessonView(
        Guid PublishedVersionId,
        string CourseTitle,
        CurriculumPackageContract.Lesson Lesson);
}
