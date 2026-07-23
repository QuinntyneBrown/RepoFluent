using System.Security.Claims;
using RepoFluent.Application;

namespace RepoFluent.Api;

public static class HttpContextExtensions
{
    public static ActorContext GetActor(this HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new WorkflowException(401, "IAM_AUTHENTICATION_REQUIRED", "Authentication is required.");
        var tenantId = context.User.FindFirstValue("tenant_id")
            ?? throw new WorkflowException(401, "IAM_TENANT_REQUIRED", "Tenant context is required.");
        var roles = context.User.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value)
            .ToHashSet(StringComparer.Ordinal);
        return new ActorContext(userId, tenantId, roles);
    }
}
