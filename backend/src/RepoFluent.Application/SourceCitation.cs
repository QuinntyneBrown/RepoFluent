namespace RepoFluent.Application;

public sealed record SourceCitation(
    string SourceId,
    string Document,
    string Locator,
    string EvidenceType);
