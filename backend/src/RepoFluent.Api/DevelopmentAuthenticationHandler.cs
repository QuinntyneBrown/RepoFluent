using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace RepoFluent.Api;

public sealed class DevelopmentAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IWebHostEnvironment environment)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "DevelopmentPersona";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!environment.IsDevelopment()
            && !environment.IsEnvironment("E2E")
            && !environment.IsEnvironment("Testing"))
        {
            return Task.FromResult(AuthenticateResult.Fail("Development personas are disabled."));
        }

        if (!Request.Headers.TryGetValue("X-RepoFluent-Dev-User", out var userHeader))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var userId = userHeader.ToString();
        var role = userId switch
        {
            "author" => "Author",
            "reviewer" => "Reviewer",
            "administrator" => "Administrator",
            "learner" => "Learner",
            _ => null
        };
        if (role is null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Unknown development persona."));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim("tenant_id", "tenant-demo"),
            new Claim(ClaimTypes.Role, role)
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName)));
    }
}
