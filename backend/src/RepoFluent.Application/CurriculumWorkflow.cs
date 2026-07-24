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
    public const string ContractVersion = "0.1.0";
    public const string ValidatorVersion = "0.1.0";
    public static readonly TimeSpan StaleValidationThreshold = TimeSpan.FromMinutes(5);

    private static readonly IReadOnlyList<string> ValidationCheckCategories =
    [
        "version",
        "schema",
        "identifiers",
        "references",
        "ordering",
        "content-types",
        "source-references",
        "provenance",
        "assessment-integrity",
        "security-restrictions",
        "configured-limits"
    ];

    public async Task<ImportReceipt> ReceiveAsync(
        ActorContext actor,
        string fileName,
        string contentType,
        byte[] bytes,
        string correlationId,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Author");
        string rawPackage;
        try
        {
            if (!fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase)
                || !contentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
            {
                throw new WorkflowException(
                    400,
                    "CLI_UNSUPPORTED_MEDIA",
                    "A JSON curriculum package is required.");
            }

            if (bytes.Length == 0 || bytes.Length > MaximumPackageBytes)
            {
                throw new WorkflowException(
                    400,
                    "CLI_PACKAGE_LIMIT",
                    "The curriculum package size is outside the supported limit.");
            }

            rawPackage = PackageIntakeScanner.ReadJson(bytes);
        }
        catch (WorkflowException)
        {
            await store.RecordAuditAsync(
                actor.TenantId,
                actor.UserId,
                "curriculum.intake-rejected",
                "upload",
                correlationId,
                cancellationToken);
            throw;
        }

        var checksum = $"sha256:{Convert.ToHexStringLower(SHA256.HashData(bytes))}";
        var (packageId, packageVersion) = PackageIntakeScanner.ReadIdentity(rawPackage);
        if (!string.IsNullOrEmpty(packageId) && !string.IsNullOrEmpty(packageVersion))
        {
            var existing = await store.GetImportByPackageIdentityAsync(
                actor.TenantId,
                packageId,
                packageVersion,
                cancellationToken);
            if (existing is not null)
            {
                return await ResolveExistingReceiptAsync(
                    actor,
                    existing,
                    checksum,
                    correlationId,
                    cancellationToken);
            }
        }

        var id = Guid.NewGuid();
        var record = new CurriculumRecord
        {
            Id = id,
            TenantId = actor.TenantId,
            AuthorId = actor.UserId,
            RawPackage = rawPackage,
            Checksum = checksum,
            CorrelationId = correlationId,
            CreatedAt = timeProvider.GetUtcNow(),
            Status = CurriculumStatus.Received,
            PackageId = packageId,
            PackageVersion = packageVersion
        };
        try
        {
            await store.AddImportAsync(record, cancellationToken);
        }
        catch (ConcurrentPackageIdentityException)
        {
            var existing = await store.GetImportByPackageIdentityAsync(
                actor.TenantId,
                packageId,
                packageVersion,
                cancellationToken)
                ?? throw new WorkflowException(
                    503,
                    "CLI_INTAKE_RETRY",
                    "The package identity is being received. Retry the request.");
            return await ResolveExistingReceiptAsync(
                actor,
                existing,
                checksum,
                correlationId,
                cancellationToken);
        }

        return new(
            id,
            checksum,
            CurriculumStatus.Received,
            correlationId,
            $"/api/curriculum-imports/{id}",
            false);
    }

    public async Task<ImportStatus> GetStatusAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Author", "Reviewer", "Administrator", "Auditor");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        return ToStatus(actor, record);
    }

    public async Task<LifecycleHistory> GetHistoryAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Author", "Administrator", "Auditor");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        var entries = await store.GetLifecycleAuditAsync(
            actor.TenantId,
            id,
            cancellationToken);
        return new(
            record.Id,
            record.PackageId,
            record.PackageVersion,
            record.Checksum,
            record.Status,
            record.CorrelationId,
            entries);
    }

    public async Task<ImportStatus> RetryValidationAsync(
        ActorContext actor,
        Guid id,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Author", "Administrator");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.Status != CurriculumStatus.Validating || !IsStale(record))
        {
            throw Conflict(
                "CLI_RETRY_NOT_ACTIONABLE",
                "Only stale validation processing can be retried.");
        }

        var lifecycle = Rehydrate(record);
        TryTransition(lifecycle.RecoverValidation);
        record.Status = lifecycle.Status;
        record.ProcessingStartedAt = null;
        record.ValidationCompletedAt = null;
        await store.SaveImportAsync(
            record,
            "curriculum.retry-requested",
            actor.UserId,
            cancellationToken);
        return ToStatus(actor, record);
    }

    public async Task<ImportStatus> AcknowledgeWarningsAsync(
        ActorContext actor,
        Guid id,
        WarningAcknowledgementRequest request,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Reviewer");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.Status != CurriculumStatus.Draft)
        {
            throw Conflict(
                "CLI_WARNING_ACKNOWLEDGEMENT_GATE",
                "Warnings can be acknowledged only for a valid draft.");
        }

        var report = record.ValidationReport
            ?? throw Conflict(
                "CLI_VALIDATION_REPORT_REQUIRED",
                "The validation report is not available.");
        if (report.ErrorCount > 0 || report.WarningCount == 0)
        {
            throw Conflict(
                "CLI_WARNING_ACKNOWLEDGEMENT_GATE",
                "The draft does not have an acknowledgeable warning set.");
        }

        if (!string.Equals(record.Checksum, request.PackageChecksum, StringComparison.Ordinal)
            || !string.Equals(report.IssueChecksum, request.IssueChecksum, StringComparison.Ordinal))
        {
            throw Conflict(
                "CLI_STALE_WARNING_REPORT",
                "The warning acknowledgement no longer matches the package and issue set.");
        }

        record.WarningAcknowledgement = new(
            actor.UserId,
            timeProvider.GetUtcNow(),
            record.Checksum,
            report.IssueChecksum,
            string.IsNullOrWhiteSpace(request.Rationale) ? null : request.Rationale.Trim());
        await store.SaveImportAsync(
            record,
            "curriculum.warnings-acknowledged",
            actor.UserId,
            cancellationToken);
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

        var validationReport = record.ValidationReport
            ?? throw Conflict(
                "CLI_VALIDATION_REPORT_REQUIRED",
                "The validation report is not available.");
        return new(
            record.Id,
            true,
            record.Checksum,
            validationReport,
            PackagePresenter.ForReview(PackageValidator.ReadTrusted(record.RawPackage)));
    }

    public async Task<ImportStatus> ReviewAsync(
        ActorContext actor,
        Guid id,
        ReviewRequest request,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Reviewer");
        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.ReviewDecision is not null)
        {
            throw Conflict(
                "CLI_REVIEW_DECISION_IMMUTABLE",
                "The draft already has an immutable review decision.");
        }

        if (!string.Equals(record.Checksum, request.Checksum, StringComparison.Ordinal))
        {
            throw Conflict("CLI_STALE_CHECKSUM", "The review checksum no longer matches the draft.");
        }

        var report = record.ValidationReport
            ?? throw Conflict(
                "CLI_VALIDATION_REPORT_REQUIRED",
                "The validation report is not available.");
        if (!string.Equals(
                report.IssueChecksum,
                request.ValidationIssueChecksum,
                StringComparison.Ordinal))
        {
            throw Conflict(
                "CLI_STALE_VALIDATION_REPORT",
                "The review validation report no longer matches the draft.");
        }

        var isApproved = string.Equals(request.Decision, "approved", StringComparison.OrdinalIgnoreCase);
        var isRejected = string.Equals(request.Decision, "rejected", StringComparison.OrdinalIgnoreCase);
        if (!isApproved && !isRejected)
        {
            throw new WorkflowException(400, "CLI_INVALID_DECISION", "Decision must be approved or rejected.");
        }

        if (isRejected && string.IsNullOrWhiteSpace(request.Rationale))
        {
            throw new WorkflowException(
                400,
                "CLI_REVIEW_RATIONALE_REQUIRED",
                "A rationale is required when rejecting a draft.");
        }

        if (isApproved && HasUnacknowledgedWarnings(record))
        {
            throw Conflict(
                "CLI_WARNING_ACKNOWLEDGEMENT_REQUIRED",
                "The exact warning report requires acknowledgement before approval.");
        }

        var lifecycle = Rehydrate(record);
        TryTransition(() => lifecycle.Review(actor.UserId, isApproved, canReviewOwnPackage: true));
        record.Status = lifecycle.Status;
        record.ReviewerId = lifecycle.ReviewerId;
        record.ReviewedAt = timeProvider.GetUtcNow();
        record.ReviewDecision = new(
            actor.UserId,
            actor.TenantId,
            record.PackageId,
            record.PackageVersion,
            record.Checksum,
            report.IssueChecksum,
            record.Status.ToString(),
            record.ReviewedAt.Value,
            record.WarningAcknowledgement,
            string.IsNullOrWhiteSpace(request.Rationale) ? null : request.Rationale.Trim());
        try
        {
            await store.SaveImportAsync(
                record,
                isApproved ? "curriculum.approved" : "curriculum.rejected",
                actor.UserId,
                cancellationToken);
        }
        catch (ConcurrentReviewDecisionException)
        {
            throw Conflict(
                "CLI_REVIEW_DECISION_IMMUTABLE",
                "The draft already has an immutable review decision.");
        }

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

        var reviewDecision = record.ReviewDecision
            ?? throw Conflict(
                "CLI_PUBLICATION_REVIEW_REQUIRED",
                "An immutable approval decision is required before publication.");
        var validationReport = record.ValidationReport
            ?? throw Conflict(
                "CLI_VALIDATION_REPORT_REQUIRED",
                "The validation report is not available.");
        if (!string.Equals(reviewDecision.Decision, nameof(CurriculumStatus.Approved), StringComparison.Ordinal)
            || !string.Equals(reviewDecision.PackageChecksum, record.Checksum, StringComparison.Ordinal)
            || !string.Equals(
                reviewDecision.ValidationIssueChecksum,
                validationReport.IssueChecksum,
                StringComparison.Ordinal))
        {
            throw Conflict(
                "CLI_PUBLICATION_CHANGED",
                "The approved package or validation report changed before publication.");
        }

        var lifecycle = Rehydrate(record);
        var versionId = Guid.NewGuid();
        TryTransition(() => lifecycle.Publish(versionId));
        record.Status = lifecycle.Status;
        record.PublishedVersionId = lifecycle.PublishedVersionId;
        record.PublishedAt ??= timeProvider.GetUtcNow();
        record.Publication = new(
            versionId,
            actor.TenantId,
            record.Id,
            record.PackageId,
            record.PackageVersion,
            record.Checksum,
            "ActiveForAssignment",
            actor.UserId,
            record.PublishedAt.Value,
            Guid.NewGuid());
        try
        {
            await store.SaveImportAsync(
                record,
                "curriculum.published",
                actor.UserId,
                cancellationToken);
        }
        catch (ConcurrentPublicationException)
        {
            var converged = await GetImportAsync(actor.TenantId, id, cancellationToken);
            if (converged.Status != CurriculumStatus.Published || converged.Publication is null)
            {
                throw Conflict(
                    "CLI_PUBLICATION_CONFLICT",
                    "The publication command did not converge on an active version.");
            }

            return ToStatus(actor, converged);
        }

        return ToStatus(actor, record);
    }

    public async Task<VersionComparison> CompareAsync(
        ActorContext actor,
        Guid id,
        Guid baseVersionId,
        CancellationToken cancellationToken)
    {
        RequireAnyRole(actor, "Reviewer", "Administrator");
        var targetRecord = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (targetRecord.Status is not (CurriculumStatus.Published or CurriculumStatus.Retired)
            || targetRecord.PublishedVersionId is not { } targetVersionId)
        {
            throw Conflict(
                "CLI_COMPARISON_TARGET_REQUIRED",
                "The comparison target must be a retained published version.");
        }

        var baseRecord = await store.GetRetainedVersionAsync(
            actor.TenantId,
            baseVersionId,
            cancellationToken)
            ?? throw new WorkflowException(
                404,
                "CLI_COMPARISON_BASE_NOT_FOUND",
                "The base published version is not available.");
        if (baseVersionId == targetVersionId)
        {
            throw Conflict(
                "CLI_COMPARISON_DISTINCT_VERSIONS_REQUIRED",
                "Choose two distinct published versions.");
        }

        if (!string.Equals(baseRecord.PackageId, targetRecord.PackageId, StringComparison.Ordinal))
        {
            throw Conflict(
                "CLI_COMPARISON_PACKAGE_MISMATCH",
                "Published versions must share the same package identity.");
        }

        var comparison = PackageVersionComparer.Compare(
            baseVersionId,
            PackageValidator.ReadTrusted(baseRecord.RawPackage),
            targetVersionId,
            PackageValidator.ReadTrusted(targetRecord.RawPackage));
        await store.RecordAuditAsync(
            actor.TenantId,
            actor.UserId,
            "curriculum.version-comparison-viewed",
            targetRecord.Id.ToString(),
            targetRecord.CorrelationId,
            cancellationToken);
        return comparison;
    }

    public async Task<ImportStatus> RetireAsync(
        ActorContext actor,
        Guid id,
        RetirementRequest request,
        CancellationToken cancellationToken)
    {
        RequireRole(actor, "Administrator");
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new WorkflowException(
                400,
                "CLI_RETIREMENT_REASON_REQUIRED",
                "A retirement reason is required.");
        }

        var record = await GetImportAsync(actor.TenantId, id, cancellationToken);
        if (record.Status == CurriculumStatus.Retired && record.Retirement is not null)
        {
            return ToStatus(actor, record);
        }

        var publication = record.Publication
            ?? throw Conflict(
                "CLI_RETIREMENT_PUBLICATION_REQUIRED",
                "Only an immutable publication can be retired.");
        var lifecycle = Rehydrate(record);
        TryTransition(lifecycle.Retire);
        record.Status = lifecycle.Status;
        record.Retirement = new(
            publication.VersionId,
            actor.TenantId,
            actor.UserId,
            timeProvider.GetUtcNow(),
            "ContinueAccess",
            request.Reason.Trim(),
            Guid.NewGuid());
        try
        {
            await store.SaveImportAsync(
                record,
                "curriculum.retired",
                actor.UserId,
                cancellationToken);
        }
        catch (ConcurrentRetirementException)
        {
            var converged = await GetImportAsync(actor.TenantId, id, cancellationToken);
            if (converged.Status != CurriculumStatus.Retired || converged.Retirement is null)
            {
                throw Conflict(
                    "CLI_RETIREMENT_CONFLICT",
                    "The retirement command did not converge on a retained version.");
            }

            return ToStatus(actor, converged);
        }

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
            var curriculum = await store.GetRetainedVersionAsync(
                actor.TenantId,
                assignment.PublishedVersionId,
                cancellationToken);
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
        var issueChecksum = ComputeIssueChecksum(issues);
        var validationCompletedAt = timeProvider.GetUtcNow();
        record.ValidationReport = new(
            ValidatorVersion,
            package?.ContractVersion ?? ContractVersion,
            record.Checksum,
            issueChecksum,
            ValidationCheckCategories,
            issues.Count(issue => issue.IsBlocking),
            issues.Count(issue => !issue.IsBlocking),
            validationCompletedAt);
        record.ValidationCompletedAt = validationCompletedAt;
        if (record.WarningAcknowledgement is { } acknowledgement
            && (!string.Equals(acknowledgement.PackageChecksum, record.Checksum, StringComparison.Ordinal)
                || !string.Equals(acknowledgement.IssueChecksum, issueChecksum, StringComparison.Ordinal)))
        {
            record.WarningAcknowledgement = null;
        }
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

        var record = await store.GetRetainedVersionAsync(actor.TenantId, versionId, cancellationToken)
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

    private ImportStatus ToStatus(
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
            if (HasUnacknowledgedWarnings(record))
            {
                actions.Add("acknowledge-warnings");
            }
            else
            {
                actions.Add("review");
            }
        }

        if (record.Status == CurriculumStatus.Approved && actor.IsInRole("Administrator"))
        {
            actions.Add("publish");
        }

        if (record.Status == CurriculumStatus.Published && actor.IsInRole("Administrator"))
        {
            actions.Add("assign");
            actions.Add("retire");
        }

        if (record.Status is CurriculumStatus.Published or CurriculumStatus.Retired
            && (actor.IsInRole("Reviewer") || actor.IsInRole("Administrator")))
        {
            actions.Add("compare");
        }

        if (actor.IsInRole("Author")
            || actor.IsInRole("Administrator")
            || actor.IsInRole("Auditor"))
        {
            actions.Add("audit");
        }

        if (record.Status == CurriculumStatus.Validating
            && IsStale(record)
            && (actor.IsInRole("Author") || actor.IsInRole("Administrator")))
        {
            actions.Add("retry");
        }

        return new(
            record.Id,
            record.Title,
            record.Checksum,
            record.Status,
            record.Issues,
            record.PublishedVersionId,
            actions,
            record.CorrelationId,
            record.ValidationReport,
            record.WarningAcknowledgement,
            record.PackageId,
            record.PackageVersion,
            record.ValidationAttemptCount,
            record.ReviewDecision,
            record.Publication,
            record.Retirement,
            ToProgress(record));
    }

    private LifecycleProgress ToProgress(CurriculumRecord record)
    {
        (string activeStage, IReadOnlyList<string> completedStages) = record.Status switch
        {
            CurriculumStatus.Received => ("Intake queued", Array.Empty<string>()),
            CurriculumStatus.Validating => ("Validation", ["Intake"]),
            CurriculumStatus.ValidationFailed => (
                "Validation action required",
                ["Intake", "Validation"]),
            CurriculumStatus.Draft => ("Review", ["Intake", "Validation", "Draft import"]),
            CurriculumStatus.Approved => (
                "Publication",
                ["Intake", "Validation", "Draft import", "Review"]),
            CurriculumStatus.Rejected => (
                "Review action required",
                ["Intake", "Validation", "Draft import", "Review"]),
            CurriculumStatus.Published => (
                "Published availability",
                ["Intake", "Validation", "Draft import", "Review", "Publication"]),
            CurriculumStatus.Retired => (
                "Retired history",
                ["Intake", "Validation", "Draft import", "Review", "Publication", "Retirement"]),
            _ => ("Lifecycle", Array.Empty<string>())
        };
        var stale = IsStale(record);
        var blockingIssue = record.Issues.FirstOrDefault(issue => issue.IsBlocking);
        var failureCode = stale
            ? "CLI_VALIDATION_STALE"
            : record.Status == CurriculumStatus.Rejected
                ? "CLI_REVIEW_REJECTED"
                : blockingIssue?.Code;
        var failureDetail = stale
            ? "Validation processing exceeded its lease. Retry resumes at validation."
            : record.Status == CurriculumStatus.Rejected
                ? "Review rejected this package checksum. Submit a corrected package version for validation."
                : blockingIssue is null
                    ? null
                    : $"{blockingIssue.Message} Resolve {blockingIssue.Path} and submit a new version.";
        return new(
            activeStage,
            completedStages,
            record.CreatedAt,
            record.ProcessingStartedAt,
            record.ValidationCompletedAt,
            record.ReviewedAt,
            record.PublishedAt,
            record.Retirement?.RetiredAt,
            stale,
            stale
                || record.Status is CurriculumStatus.ValidationFailed
                    or CurriculumStatus.Rejected,
            failureCode,
            failureDetail);
    }

    private bool IsStale(CurriculumRecord record) =>
        record.Status == CurriculumStatus.Validating
        && record.ProcessingStartedAt is { } startedAt
        && timeProvider.GetUtcNow() - startedAt >= StaleValidationThreshold;

    private static bool HasUnacknowledgedWarnings(CurriculumRecord record)
    {
        var report = record.ValidationReport;
        if (report is null || report.WarningCount == 0)
        {
            return false;
        }

        return record.WarningAcknowledgement is not { } acknowledgement
            || !string.Equals(acknowledgement.PackageChecksum, record.Checksum, StringComparison.Ordinal)
            || !string.Equals(acknowledgement.IssueChecksum, report.IssueChecksum, StringComparison.Ordinal);
    }

    private static string ComputeIssueChecksum(IReadOnlyList<ValidationIssue> issues)
    {
        var normalized = string.Join(
            '\n',
            issues
                .OrderBy(issue => issue.Code, StringComparer.Ordinal)
                .ThenBy(issue => issue.Path, StringComparer.Ordinal)
                .ThenBy(issue => issue.Severity, StringComparer.Ordinal)
                .Select(issue =>
                    $"{issue.Code}|{issue.Severity}|{issue.IsBlocking}|{issue.Path}|{issue.Message}"));
        return $"sha256:{Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(normalized)))}";
    }

    private async Task<CurriculumRecord> GetImportAsync(
        string tenantId,
        Guid id,
        CancellationToken cancellationToken) =>
        await store.GetImportAsync(tenantId, id, cancellationToken)
        ?? throw new WorkflowException(404, "CLI_IMPORT_NOT_FOUND", "The curriculum import is not available.");

    private async Task<ImportReceipt> ResolveExistingReceiptAsync(
        ActorContext actor,
        CurriculumRecord existing,
        string checksum,
        string correlationId,
        CancellationToken cancellationToken)
    {
        if (!string.Equals(existing.Checksum, checksum, StringComparison.Ordinal))
        {
            await store.RecordAuditAsync(
                actor.TenantId,
                actor.UserId,
                "curriculum.package-version-conflict",
                existing.Id.ToString(),
                correlationId,
                cancellationToken);
            throw Conflict(
                "CLI_PACKAGE_VERSION_CONFLICT",
                "This package identity and version already exist with different bytes. Use a new version.");
        }

        await store.RecordAuditAsync(
            actor.TenantId,
            actor.UserId,
            "curriculum.upload-replayed",
            existing.Id.ToString(),
            correlationId,
            cancellationToken);
        return new(
            existing.Id,
            existing.Checksum,
            existing.Status,
            existing.CorrelationId,
            $"/api/curriculum-imports/{existing.Id}",
            true);
    }

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
