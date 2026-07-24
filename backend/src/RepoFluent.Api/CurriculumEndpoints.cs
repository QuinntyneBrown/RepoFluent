using RepoFluent.Application;

namespace RepoFluent.Api;

public static class CurriculumEndpoints
{
    public static IEndpointRouteBuilder MapCurriculumEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var api = endpoints.MapGroup("/api").RequireAuthorization();

        api.MapPost("/curriculum-imports", ReceiveAsync).DisableAntiforgery();
        api.MapGet("/curriculum-imports/{id:guid}", GetStatusAsync);
        api.MapGet("/curriculum-imports/{id:guid}/history", GetHistoryAsync);
        api.MapPost("/curriculum-imports/{id:guid}/retry-validation", RetryValidationAsync);
        api.MapGet("/curriculum-drafts/{id:guid}/preview", GetPreviewAsync);
        api.MapPost(
            "/curriculum-drafts/{id:guid}/warning-acknowledgements",
            AcknowledgeWarningsAsync);
        api.MapPost("/curriculum-drafts/{id:guid}/review-decisions", ReviewAsync);
        api.MapPost("/curriculum-drafts/{id:guid}/publish", PublishAsync);
        api.MapGet(
            "/curriculum-drafts/{id:guid}/comparisons/{baseVersionId:guid}",
            CompareAsync);
        api.MapPost("/curriculum-drafts/{id:guid}/retire", RetireAsync);
        api.MapPost("/assignments", AssignAsync);
        api.MapGet("/learning/assignments", GetAssignmentsAsync);
        api.MapGet("/learning/versions/{versionId:guid}/courses/{courseId}", GetCourseAsync);
        api.MapGet(
            "/learning/versions/{versionId:guid}/courses/{courseId}/lessons/{lessonId}",
            GetLessonAsync);
        return endpoints;
    }

    private static async Task<IResult> ReceiveAsync(
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken)
    {
        if (!context.Request.HasFormContentType)
        {
            throw new WorkflowException(400, "CLI_FORM_REQUIRED", "A multipart curriculum upload is required.");
        }

        var form = await context.Request.ReadFormAsync(cancellationToken);
        var file = form.Files.GetFile("package")
            ?? throw new WorkflowException(400, "CLI_FILE_REQUIRED", "A curriculum package file is required.");
        await using var stream = new MemoryStream((int)file.Length);
        await file.CopyToAsync(stream, cancellationToken);
        var receipt = await workflow.ReceiveAsync(
            context.GetActor(),
            file.FileName,
            file.ContentType,
            stream.ToArray(),
            context.TraceIdentifier,
            cancellationToken);
        return Results.Accepted(receipt.StatusUrl, receipt);
    }

    private static async Task<IResult> GetStatusAsync(
        Guid id,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetStatusAsync(context.GetActor(), id, cancellationToken));

    private static async Task<IResult> GetHistoryAsync(
        Guid id,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetHistoryAsync(context.GetActor(), id, cancellationToken));

    private static async Task<IResult> RetryValidationAsync(
        Guid id,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(
            await workflow.RetryValidationAsync(
                context.GetActor(),
                id,
                cancellationToken));

    private static async Task<IResult> GetPreviewAsync(
        Guid id,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetPreviewAsync(context.GetActor(), id, cancellationToken));

    private static async Task<IResult> AcknowledgeWarningsAsync(
        Guid id,
        WarningAcknowledgementRequest request,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(
            await workflow.AcknowledgeWarningsAsync(
                context.GetActor(),
                id,
                request,
                cancellationToken));

    private static async Task<IResult> ReviewAsync(
        Guid id,
        ReviewRequest request,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.ReviewAsync(context.GetActor(), id, request, cancellationToken));

    private static async Task<IResult> PublishAsync(
        Guid id,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.PublishAsync(context.GetActor(), id, cancellationToken));

    private static async Task<IResult> CompareAsync(
        Guid id,
        Guid baseVersionId,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(
            await workflow.CompareAsync(
                context.GetActor(),
                id,
                baseVersionId,
                cancellationToken));

    private static async Task<IResult> RetireAsync(
        Guid id,
        RetirementRequest request,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(
            await workflow.RetireAsync(
                context.GetActor(),
                id,
                request,
                cancellationToken));

    private static async Task<IResult> AssignAsync(
        AssignmentRequest request,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken)
    {
        var assignment = await workflow.AssignAsync(
            context.GetActor(),
            request,
            context.TraceIdentifier,
            cancellationToken);
        return Results.Created($"/api/assignments/{assignment.Id}", assignment);
    }

    private static async Task<IResult> GetAssignmentsAsync(
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetLearningAssignmentsAsync(context.GetActor(), cancellationToken));

    private static async Task<IResult> GetCourseAsync(
        Guid versionId,
        string courseId,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetCourseAsync(context.GetActor(), versionId, courseId, cancellationToken));

    private static async Task<IResult> GetLessonAsync(
        Guid versionId,
        string courseId,
        string lessonId,
        HttpContext context,
        CurriculumWorkflow workflow,
        CancellationToken cancellationToken) =>
        Results.Ok(await workflow.GetLessonAsync(context.GetActor(), versionId, courseId, lessonId, cancellationToken));
}
