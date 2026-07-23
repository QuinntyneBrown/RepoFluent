namespace RepoFluent.Application;

public sealed record AssignmentRequest(Guid PublishedVersionId, string LearnerId, bool IsRequired);
