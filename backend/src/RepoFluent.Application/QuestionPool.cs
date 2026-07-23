namespace RepoFluent.Application;

public sealed record QuestionPool(
    string Id,
    string Title,
    IReadOnlyList<AssessmentItem> Items);
