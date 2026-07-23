namespace RepoFluent.Application;

public sealed record ActorContext(string UserId, string TenantId, IReadOnlySet<string> Roles)
{
    public bool IsInRole(string role) => Roles.Contains(role);
}
