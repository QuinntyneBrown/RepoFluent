using System.Security.Cryptography;
using System.Text;
using RepoFluent.Domain;

namespace RepoFluent.Application;

public sealed class CurriculumWorkflow(
    ICurriculumStore store,
    IUserDirectory userDirectory,
    TimeProvider timeProvider)
{
    public const int MaximumPackageBytes = 512 * 1024;

    public async Task<ImportReceipt> ReceiveAsync(
        ActorContext actor,
        string fileName,
        string contentType,
        byte[] bytes,
        string correlationId,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Author");
        if (!fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase)
            || !contentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
        {
            throw new WorkflowException(400, "CLI_UNSUPPORTED_MEDIA", "A JSON curriculum package is required.");
        }

        if (bytes.Length == 0 || bytes.Length > MaximumPackageBytes)
        {
            throw new WorkflowException(400, "CLI_PACKAGE_LIMIT", "The curriculum package size is outside the supported limit.");
        }

        var id = Guid.NewGuid();
        var checksum = $"sha256:{Convert.ToHexStringLower(SHA256.HashData(bytes))}";
        var record = new CurriculumRecord
        {
            Id = id,
            TenantId = actor.TenantId,
            AuthorId = actor.UserId,
            RawPackage = Encoding.UTF8.GetString(bytes),
            Checksum = checksum,
            CorrelationId = correlationId,
            CreatedAt = timeProvider.GetUtcNow(),
            Status = CurriculumStatus.Received
        };
        await store.AddImportAsync(record, cancellationToken);
        return new(id, checksum, CurriculumStatus.Received, correlationId, $"/api/curriculum-imports/{id}");
    }

    public async Task<ImportStatus> GetStatusAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Author", "Reviewer", "Administrator");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        return ToStatus(actor, record);
    }

    public async Task<Preview> GetPreviewAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Author", "Reviewer", "Administrator");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.Status is not (CurriculumStatus.Draft or CurriculumStatus.Approved))
        {
            throw Conflict("CLI_PREVIEW_GATE", "Only a valid draft can be previewed.");
        }

        return new(record.Id, true, PackageValidator.ReadTrusted(record.RawPackage));
    }

    public async Task<ImportStatus> ReviewAsync(
        ActorContext actor,
        Guid id,
        ReviewRequest request,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Reviewer");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (!string.Equals(record.Checksum, request.Checksum, StringComparison.Ordinal))
        {
            throw Conflict("CLI_STALE_CHECKSUM", "The review checksum no longer matches the draft.");
        }

        var isApproved = string.Equals(request.Decision, "approved", StringComparison.OrdinalIgnoreCase);
        var isRejected = string.Equals(request.Decision, "rejected", StringComparison.OrdinalIgnoreCase);
        if (!isApproved && !isRejected)
        {
            throw new WorkflowException(400, "CLI_INVALID_DECISION", "Decision must be approved or rejected.");
        }

        var lifecycle = Rehydrate(record);
        TryTransition(() => lifecycle.Review(actor.UserId, isApproved));
        record.Status = lifecycle.Status;
        record.ReviewerId = lifecycle.ReviewerId;
        record.ReviewedAt = timeProvider.GetUtcNow();
        await store.SaveImportAsync(record, isApproved ? "curriculum.approved" : "curriculum.rejected", actor.UserId, cancellationToken);
        return ToStatus(actor, record);
    }

    public async Task<ImportStatus> PublishAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Administrator");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.Status == CurriculumStatus.Published)
        {
            return ToStatus(actor, record);
        }

        var lifecycle = Rehydrate(record);
        var versionId = Guid.NewGuid();
        TryTransition(() => lifecycle.Publish(versionId));
        record.Status = lifecycle.Status;
        record.PublishedVersionId = lifecycle.PublishedVersionId;
        record.PublishedAt ??= timeProvider.GetUtcNow();
        await store.SaveImportAsync(record, "curriculum.published", actor.UserId, cancellationToken);
        return ToStatus(actor, record);
    }

    public async Task<Assignment> AssignAsync(
        ActorContext actor,
        AssignmentRequest request,
        string correlationId,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Administrator");
        if (!userDirectory.IsLearner(actor.TenantId, request.LearnerId))
        {
            throw new WorkflowException(404, "ATO_LEARNER_NOT_FOUND", "The learner is not available in this tenant.");
        }

        var curriculum = await store.GetPublishedAsync(actor.TenantId, request.PublishedVersionId, cancellationToken)
            ?? throw new WorkflowException(404, "ATO_VERSION_NOT_FOUND", "The published curriculum version is not available.");
        if (!await store.AssignmentExistsAsync(actor.TenantId, request.LearnerId, request.PublishedVersionId, cancellationToken))
        {
            await store.AddAssignmentAsync(
                new AssignmentRecord
                {
                    Id = Guid.NewGuid(),
                    TenantId = actor.TenantId,
                    LearnerId = request.LearnerId,
                    PublishedVersionId = request.PublishedVersionId,
                    IsRequired = request.IsRequired,
                    CreatedAt = timeProvider.GetUtcNow()
                },
                actor.UserId,
                correlationId,
                cancellationToken);
        }

        var package = PackageValidator.ReadTrusted(curriculum.RawPackage);
        var assignment = (await store.GetAssignmentsAsync(actor.TenantId, request.LearnerId, cancellationToken))
            .Single(item => item.PublishedVersionId == request.PublishedVersionId);
        return ToAssignment(assignment, package);
    }

    public async Task<IReadOnlyList<Assignment>> GetLearningAssignmentsAsync(
        ActorContext actor,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Learner");
        var assignments = await store.GetAssignmentsAsync(actor.TenantId, actor.UserId, cancellationToken);
        var results = new List<Assignment>();
        foreach (var assignment in assignments)
        {
            var curriculum = await store.GetPublishedAsync(actor.TenantId, assignment.PublishedVersionId, cancellationToken);
            if (curriculum is not null)
            {
                results.Add(ToAssignment(assignment, PackageValidator.ReadTrusted(curriculum.RawPackage)));
            }
        }

        return results;
    }

    public async Task<CourseView> GetCourseAsync(
        ActorContext actor,
        Guid versionId,
        string courseId,
        CancellationToken cancellationToken)
    {
        var package = await GetAssignedPackageAsync(actor, versionId, cancellationToken);
        var course = package.Courses.FirstOrDefault(item => item.Id == courseId)
            ?? throw new WorkflowException(404, "LEX_COURSE_NOT_FOUND", "The course is not available.");
        return new(versionId, course);
    }

    public async Task<LessonView> GetLessonAsync(
        ActorContext actor,
        Guid versionId,
        string courseId,
        string lessonId,
        CancellationToken cancellationToken)
    {
        var package = await GetAssignedPackageAsync(actor, versionId, cancellationToken);
        var course = package.Courses.FirstOrDefault(item => item.Id == courseId)
            ?? throw new WorkflowException(404, "LEX_COURSE_NOT_FOUND", "The course is not available.");
        var lesson = course.Modules.SelectMany(module => module.Lessons).FirstOrDefault(item => item.Id == lessonId)
            ?? throw new WorkflowException(404, "LEX_LESSON_NOT_FOUND", "The lesson is not available.");
        return new(versionId, course.Title, lesson);
    }

    public async Task ValidateNextAsync(CancellationToken cancellationToken)
    {
        var record = await store.ClaimReceivedAsync(cancellationToken);
        if (record is null)
        {
            return;
        }

        var (package, issues) = PackageValidator.Validate(record.RawPackage);
        var lifecycle = Rehydrate(record);
        TryTransition(() => lifecycle.CompleteValidation(issues.Any(issue => issue.IsBlocking)));
        record.Status = lifecycle.Status;
        record.Issues = issues;
        if (package is not null)
        {
            record.Title = package.Title;
            record.PackageId = package.PackageId;
            record.PackageVersion = package.Version;
        }

        await store.SaveImportAsync(record, "curriculum.validation-completed", "system", cancellationToken);
    }

    private async Task<Package> GetAssignedPackageAsync(
        ActorContext actor,
        Guid versionId,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Learner");
        if (!await store.AssignmentExistsAsync(actor.TenantId, actor.UserId, versionId, cancellationToken))
        {
            throw new WorkflowException(404, "LEX_ASSIGNMENT_NOT_FOUND", "The learning content is not assigned to this learner.");
        }

        var record = await store.GetPublishedAsync(actor.TenantId, versionId, cancellationToken)
            ?? throw new WorkflowException(404, "LEX_VERSION_NOT_FOUND", "The learning content is not available.");
        return PackageValidator.ReadTrusted(record.RawPackage);
    }

    private static Assignment ToAssignment(
        AssignmentRecord assignment,
        Package package) =>
        new(
            assignment.Id,
            assignment.PublishedVersionId,
            package.Title,
            package.Description,
            assignment.IsRequired,
            "NotStarted",
            assignment.IsRequired ? "Begin your required course" : "Explore this course",
            package.Courses[0].Id);

    private static ImportStatus ToStatus(
        ActorContext actor,
        CurriculumRecord record)
    {
        var actions = new List<string>();
        if (record.Status is CurriculumStatus.Draft or CurriculumStatus.Approved
            && actor.IsInRole("Reviewer"))
        {
            actions.Add("preview");
        }

        if (record.Status == CurriculumStatus.Draft && actor.IsInRole("Reviewer"))
        {
            actions.Add("review");
        }

        if (record.Status == CurriculumStatus.Approved && actor.IsInRole("Administrator"))
        {
            actions.Add("publish");
        }

        if (record.Status == CurriculumStatus.Published && actor.IsInRole("Administrator"))
        {
            actions.Add("assign");
        }

        return new(
            record.Id,
            record.Title,
            record.Checksum,
            record.Status,
            record.Issues,
            record.PublishedVersionId,
            actions,
            record.CorrelationId);
    }

    private async Task<CurriculumRecord> GetImportAsync(
        string tenantId,
        Guid id,
        CancellationToken cancellationToken) =>
        await store.GetImportAsync(tenantId, id, cancellationToken)
        ?? throw new WorkflowException(404, "CLI_IMPORT_NOT_FOUND", "The curriculum import is not available.");

    private static CurriculumLifecycle Rehydrate(CurriculumRecord record) =>
        CurriculumLifecycle.Rehydrate(
            record.Id,
            record.AuthorId,
            record.Status,
            record.ReviewerId,
            record.PublishedVersionId);

    private static void TryTransition(Action transition)
    {
        try
        {
            transition();
        }
        catch (CurriculumLifecycleException exception)
        {
            throw Conflict("CLI_INVALID_TRANSITION", exception.Message);
        }
    }

    private static WorkflowException Conflict(string code, string message) => new(409, code, message);

    private static void RequireRole(ActorContext actor, string role)
    {
        if (!actor.IsInRole(role))
        {
            throw new WorkflowException(403, "IAM_FORBIDDEN", "The current role cannot perform this operation.");
        }
    }

    private static void RequireAnyRole(ActorContext actor, params string[] roles)
    {
        if (!roles.Any(actor.IsInRole))
        {
            throw new WorkflowException(403, "IAM_FORBIDDEN", "The current role cannot perform this operation.");
        }
    }
}
