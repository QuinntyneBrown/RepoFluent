namespace RepoFluent.Application;

public sealed record EvidenceMetadata(
    string Confidence,
    IReadOnlyList<SourceCitation>? Citations,
    IReadOnlyList<string>? Assumptions,
    IReadOnlyList<string>? Omissions,
    IReadOnlyList<string>? ConflictingSources,
    IReadOnlyList<string>? UnresolvedQuestions);
