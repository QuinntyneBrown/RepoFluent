using RepoFluent.Application;

namespace RepoFluent.Infrastructure;

public sealed class DevelopmentUserDirectory : IUserDirectory
{
    public bool IsLearner(string tenantId, string userId) =>
        string.Equals(tenantId, "tenant-demo", StringComparison.Ordinal)
        && string.Equals(userId, "learner", StringComparison.Ordinal);
}
