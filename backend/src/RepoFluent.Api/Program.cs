using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using RepoFluent.Api;
using RepoFluent.Application;
using RepoFluent.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.Configure<FormOptions>(options =>
    options.MultipartBodyLengthLimit = CurriculumWorkflow.MaximumPackageBytes + 16 * 1024);
builder.Services.AddAuthentication(DevelopmentAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, DevelopmentAuthenticationHandler>(
        DevelopmentAuthenticationHandler.SchemeName,
        _ => { });
builder.Services.AddAuthorization();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<CurriculumWorkflow>();
builder.Services.AddRepoFluentInfrastructure(builder.Configuration);
builder.Services.AddHostedService<CurriculumValidationWorker>();

var app = builder.Build();

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        if (exception is not WorkflowException workflowException)
        {
            throw exception ?? new InvalidOperationException("An unknown API failure occurred.");
        }

        context.Response.StatusCode = workflowException.StatusCode;
        await Results.Problem(
                statusCode: workflowException.StatusCode,
                title: workflowException.Code,
                detail: workflowException.Message,
                extensions: new Dictionary<string, object?> { ["code"] = workflowException.Code })
            .ExecuteAsync(context);
    });
});
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Correlation-Id"] = context.TraceIdentifier;
    await next();
});
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("E2E"))
{
    app.MapOpenApi();
}

app.MapCurriculumEndpoints();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RepoFluentDbContext>();
    if (app.Environment.IsEnvironment("E2E"))
    {
        await dbContext.Database.EnsureDeletedAsync();
    }

    await dbContext.Database.MigrateAsync();
}

app.Run();

public partial class Program;
