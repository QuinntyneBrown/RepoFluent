namespace RepoFluent.Application;

public interface IUserDirectory
{
    bool IsLearner(string tenantId, string userId);
}
