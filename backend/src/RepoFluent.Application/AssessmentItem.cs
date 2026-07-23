namespace RepoFluent.Application;

public sealed record AssessmentItem(
    string Id,
    string Type,
    string Prompt,
    IReadOnlyList<string>? Options,
    string? Rationale,
    GradingDefinition Grading,
    AnswerDefinition Answer)
{
    public EvidenceMetadata? Evidence { get; init; }
}
