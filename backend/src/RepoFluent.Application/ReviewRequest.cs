namespace RepoFluent.Application;

public sealed record ReviewRequest(
    string Decision,
    string Checksum,
    string ValidationIssueChecksum,
    string? Rationale);
