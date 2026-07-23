namespace RepoFluent.Application;

public sealed record Preview(Guid ImportId, bool IsDraft, Package Package);
