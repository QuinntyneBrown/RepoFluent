using System.Text.Json;
using System.Text.RegularExpressions;

namespace RepoFluent.Application;

public sealed class PackageValidator
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public static (Package? Package, IReadOnlyList<ValidationIssue> Issues)
        Validate(string json)
    {
        Package? package;
        try
        {
            package = JsonSerializer.Deserialize<Package>(json, SerializerOptions);
        }
        catch (JsonException exception)
        {
            return (
                null,
                [Issue("CIC_INVALID_JSON", "Package is not valid JSON.", exception.Path ?? string.Empty)]);
        }

        if (package is null)
        {
            return (null, [Issue("CIC_EMPTY_PACKAGE", "Package content is required.", string.Empty)]);
        }

        var issues = new List<ValidationIssue>();
        Require(package.ContractVersion == "0.1.0", "CIC_UNSUPPORTED_VERSION", "/contractVersion", issues);
        Require(!string.IsNullOrWhiteSpace(package.PackageId), "CIC_REQUIRED", "/packageId", issues);
        Require(!string.IsNullOrWhiteSpace(package.Version), "CIC_REQUIRED", "/version", issues);
        Require(!string.IsNullOrWhiteSpace(package.Title), "CIC_REQUIRED", "/title", issues);
        Require(!string.IsNullOrWhiteSpace(package.Description), "CIC_REQUIRED", "/description", issues);
        Require(!string.IsNullOrWhiteSpace(package.Owner), "CIC_REQUIRED", "/owner", issues);
        Require(!string.IsNullOrWhiteSpace(package.Locale), "CIC_REQUIRED", "/locale", issues);
        Require(package.CreatedAt != default, "CIC_REQUIRED", "/createdAt", issues);
        Require(!string.IsNullOrWhiteSpace(package.CreatedBy), "CIC_REQUIRED", "/createdBy", issues);
        Require(package.SourceSnapshot?.Repositories?.Count > 0, "CIC_REQUIRED", "/sourceSnapshot/repositories", issues);
        Require(package.Systems?.Count > 0, "CIC_REQUIRED", "/systems", issues);
        Require(package.Relationships?.Count > 0, "CIC_REQUIRED", "/relationships", issues);
        Require(package.Terminology?.Count > 0, "CIC_REQUIRED", "/terminology", issues);
        Require(package.Courses?.Count > 0, "CIC_REQUIRED", "/courses", issues);
        Require(package.Assessments?.Count > 0, "CIC_REQUIRED", "/assessments", issues);

        var identifiers = new HashSet<string>(StringComparer.Ordinal);
        var repositories = package.SourceSnapshot?.Repositories ?? [];
        for (var repositoryIndex = 0; repositoryIndex < repositories.Count; repositoryIndex++)
        {
            var repository = repositories[repositoryIndex];
            var repositoryPath = $"/sourceSnapshot/repositories/{repositoryIndex}";
            AddIdentifier(repository.Id, $"{repositoryPath}/id", identifiers, issues);
            Require(!string.IsNullOrWhiteSpace(repository.Name), "CIC_REQUIRED", $"{repositoryPath}/name", issues);
            Require(
                !string.IsNullOrWhiteSpace(repository.Revision)
                    || !string.IsNullOrWhiteSpace(repository.Branch)
                    || !string.IsNullOrWhiteSpace(repository.Commit),
                "CIC_SOURCE_REVISION_REQUIRED",
                repositoryPath,
                issues);
            ValidateRelativePath(repository.RelativeRoot, $"{repositoryPath}/relativeRoot", issues);
            var documents = repository.Documents ?? [];
            Require(documents.Count > 0, "CIC_REQUIRED", $"{repositoryPath}/documents", issues);
            for (var documentIndex = 0; documentIndex < documents.Count; documentIndex++)
            {
                ValidateRelativePath(
                    documents[documentIndex],
                    $"{repositoryPath}/documents/{documentIndex}",
                    issues);
            }

            Require(repository.CapturedAt.HasValue, "CIC_REQUIRED", $"{repositoryPath}/capturedAt", issues);
        }

        var repositoryIds = repositories.Select(repository => repository.Id).ToHashSet(StringComparer.Ordinal);
        var repositoryById = new Dictionary<string, Repository>(StringComparer.Ordinal);
        foreach (var repository in repositories)
        {
            if (!string.IsNullOrWhiteSpace(repository.Id))
            {
                repositoryById.TryAdd(repository.Id, repository);
            }
        }
        var systems = package.Systems ?? [];
        var systemIds = new HashSet<string>(StringComparer.Ordinal);
        var subsystemIds = new HashSet<string>(StringComparer.Ordinal);
        for (var systemIndex = 0; systemIndex < systems.Count; systemIndex++)
        {
            var system = systems[systemIndex];
            var systemPath = $"/systems/{systemIndex}";
            AddIdentifier(system.Id, $"{systemPath}/id", identifiers, issues);
            systemIds.Add(system.Id);
            Require(!string.IsNullOrWhiteSpace(system.Name), "CIC_REQUIRED", $"{systemPath}/name", issues);
            Require(!string.IsNullOrWhiteSpace(system.Responsibility), "CIC_REQUIRED", $"{systemPath}/responsibility", issues);
            Require(!string.IsNullOrWhiteSpace(system.Boundary), "CIC_REQUIRED", $"{systemPath}/boundary", issues);
            var subsystems = system.Subsystems ?? [];
            for (var subsystemIndex = 0; subsystemIndex < subsystems.Count; subsystemIndex++)
            {
                var subsystem = subsystems[subsystemIndex];
                var subsystemPath = $"{systemPath}/subsystems/{subsystemIndex}";
                AddIdentifier(subsystem.Id, $"{subsystemPath}/id", identifiers, issues);
                subsystemIds.Add(subsystem.Id);
                Require(!string.IsNullOrWhiteSpace(subsystem.Name), "CIC_REQUIRED", $"{subsystemPath}/name", issues);
                Require(!string.IsNullOrWhiteSpace(subsystem.Responsibility), "CIC_REQUIRED", $"{subsystemPath}/responsibility", issues);
                Require(!string.IsNullOrWhiteSpace(subsystem.Boundary), "CIC_REQUIRED", $"{subsystemPath}/boundary", issues);
            }
        }

        var architectureNodeIds = systemIds.Concat(subsystemIds).ToHashSet(StringComparer.Ordinal);
        var relationships = package.Relationships ?? [];
        for (var relationshipIndex = 0; relationshipIndex < relationships.Count; relationshipIndex++)
        {
            var relationship = relationships[relationshipIndex];
            var relationshipPath = $"/relationships/{relationshipIndex}";
            AddIdentifier(relationship.Id, $"{relationshipPath}/id", identifiers, issues);
            Require(
                architectureNodeIds.Contains(relationship.SourceId),
                "CIC_DANGLING_RELATIONSHIP",
                $"{relationshipPath}/sourceId",
                issues);
            Require(
                architectureNodeIds.Contains(relationship.TargetId),
                "CIC_DANGLING_RELATIONSHIP",
                $"{relationshipPath}/targetId",
                issues);
            Require(
                relationship.Type is "depends-on" or "calls" or "publishes-to" or "reads-from" or "contains",
                "CIC_UNSUPPORTED_RELATIONSHIP",
                $"{relationshipPath}/type",
                issues);
            Require(!string.IsNullOrWhiteSpace(relationship.Description), "CIC_REQUIRED", $"{relationshipPath}/description", issues);
        }

        var terminology = package.Terminology ?? [];
        var terminologyTerms = new HashSet<string>(StringComparer.Ordinal);
        for (var termIndex = 0; termIndex < terminology.Count; termIndex++)
        {
            Require(!string.IsNullOrWhiteSpace(terminology[termIndex].Term), "CIC_REQUIRED", $"/terminology/{termIndex}/term", issues);
            Require(!string.IsNullOrWhiteSpace(terminology[termIndex].Definition), "CIC_REQUIRED", $"/terminology/{termIndex}/definition", issues);
            terminologyTerms.Add(terminology[termIndex].Term);
        }

        var learningObjectiveIds = new HashSet<string>(StringComparer.Ordinal);
        var assessmentIds = (package.Assessments ?? [])
            .Select(assessment => assessment.Id)
            .ToHashSet(StringComparer.Ordinal);
        var courses = package.Courses ?? [];
        for (var courseIndex = 0; courseIndex < courses.Count; courseIndex++)
        {
            var course = courses[courseIndex];
            var coursePath = $"/courses/{courseIndex}";
            AddIdentifier(course.Id, $"{coursePath}/id", identifiers, issues);
            Require(!string.IsNullOrWhiteSpace(course.Title), "CIC_REQUIRED", $"{coursePath}/title", issues);
            Require(!string.IsNullOrWhiteSpace(course.Description), "CIC_REQUIRED", $"{coursePath}/description", issues);
            Require(course.Difficulty is "foundational" or "intermediate" or "advanced", "CIC_UNSUPPORTED_DIFFICULTY", $"{coursePath}/difficulty", issues);
            Require(course.EstimatedMinutes > 0, "CIC_INVALID_DURATION", $"{coursePath}/estimatedMinutes", issues);
            Require(course.Audience?.Count > 0, "CIC_REQUIRED", $"{coursePath}/audience", issues);
            Require(course.Tags?.Count > 0, "CIC_REQUIRED", $"{coursePath}/tags", issues);
            Require(course.Order > 0, "CIC_INVALID_ORDER", $"{coursePath}/order", issues);
            Require(course.Prerequisites?.Count > 0, "CIC_REQUIRED", $"{coursePath}/prerequisites", issues);
            Require(course.CompletionRules?.Count > 0, "CIC_REQUIRED", $"{coursePath}/completionRules", issues);
            Require(course.Objectives?.Count > 0, "CIC_REQUIRED", $"{coursePath}/objectives", issues);
            ValidateLearningObjectives(
                course.Objectives ?? [],
                $"{coursePath}/objectives",
                identifiers,
                learningObjectiveIds,
                issues);
            Require(course.Modules?.Count > 0, "CIC_REQUIRED", $"{coursePath}/modules", issues);
            var modules = course.Modules ?? [];
            for (var moduleIndex = 0; moduleIndex < modules.Count; moduleIndex++)
            {
                var module = modules[moduleIndex];
                var modulePath = $"{coursePath}/modules/{moduleIndex}";
                AddIdentifier(module.Id, $"{modulePath}/id", identifiers, issues);
                Require(!string.IsNullOrWhiteSpace(module.Title), "CIC_REQUIRED", $"{modulePath}/title", issues);
                Require(module.Order > 0, "CIC_INVALID_ORDER", $"{modulePath}/order", issues);
                Require(module.Lessons?.Count > 0, "CIC_REQUIRED", $"{modulePath}/lessons", issues);
                var lessons = module.Lessons ?? [];
                for (var lessonIndex = 0; lessonIndex < lessons.Count; lessonIndex++)
                {
                    var lesson = lessons[lessonIndex];
                    var lessonPath = $"{modulePath}/lessons/{lessonIndex}";
                    AddIdentifier(lesson.Id, $"{lessonPath}/id", identifiers, issues);
                    Require(!string.IsNullOrWhiteSpace(lesson.Title), "CIC_REQUIRED", $"{lessonPath}/title", issues);
                    Require(lesson.EstimatedMinutes > 0, "CIC_INVALID_DURATION", $"{lessonPath}/estimatedMinutes", issues);
                    Require(lesson.Difficulty is "foundational" or "intermediate" or "advanced", "CIC_UNSUPPORTED_DIFFICULTY", $"{lessonPath}/difficulty", issues);
                    Require(lesson.Audience?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/audience", issues);
                    Require(lesson.Tags?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/tags", issues);
                    Require(lesson.Order > 0, "CIC_INVALID_ORDER", $"{lessonPath}/order", issues);
                    Require(lesson.Prerequisites?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/prerequisites", issues);
                    Require(lesson.CompletionRules?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/completionRules", issues);
                    Require(lesson.Objectives?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/objectives", issues);
                    ValidateLearningObjectives(
                        lesson.Objectives ?? [],
                        $"{lessonPath}/objectives",
                        identifiers,
                        learningObjectiveIds,
                        issues);
                    Require(lesson.Blocks?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/blocks", issues);
                    ValidateBlocks(
                        lesson.Blocks ?? [],
                        lessonPath,
                        repositoryById,
                        terminologyTerms,
                        assessmentIds,
                        issues);
                }
            }
        }

        ValidateAssessments(
            package.Assessments ?? [],
            identifiers,
            learningObjectiveIds,
            systemIds,
            subsystemIds,
            issues);

        return (package, issues.OrderBy(issue => issue.Path, StringComparer.Ordinal).ThenBy(issue => issue.Code, StringComparer.Ordinal).ToArray());
    }

    public static Package ReadTrusted(string json) =>
        JsonSerializer.Deserialize<Package>(json, SerializerOptions)
        ?? throw new InvalidOperationException("Stored curriculum package could not be read.");

    private static void ValidateBlocks(
        IReadOnlyList<Block> blocks,
        string lessonPath,
        IReadOnlyDictionary<string, Repository> repositoryById,
        HashSet<string> terminologyTerms,
        HashSet<string> assessmentIds,
        List<ValidationIssue> issues)
    {
        for (var blockIndex = 0; blockIndex < blocks.Count; blockIndex++)
        {
            var block = blocks[blockIndex];
            var path = $"{lessonPath}/blocks/{blockIndex}";
            if (block.Type is not (
                "prose"
                or "callout"
                or "diagram"
                or "codeReference"
                or "codeTour"
                or "example"
                or "glossaryLink"
                or "knowledgeCheck"))
            {
                var code = block.Type is "script" or "html" or "executable" or "macro"
                    ? "CIC_ACTIVE_CONTENT"
                    : "CIC_UNSUPPORTED_BLOCK";
                issues.Add(Issue(code, "Content block type is not supported.", $"{path}/type"));
                continue;
            }

            if (!string.IsNullOrWhiteSpace(block.ResourceUrl))
            {
                issues.Add(Issue(
                    "CIC_UNDECLARED_RESOURCE",
                    "Remote resources must be declared by an approved contract extension.",
                    $"{path}/resourceUrl"));
            }

            switch (block.Type)
            {
                case "prose":
                    RequireSafeText(block.Text, $"{path}/text", issues);
                    break;
                case "callout":
                    Require(
                        block.Tone is "information" or "warning",
                        "CIC_UNSUPPORTED_CALLOUT",
                        $"{path}/tone",
                        issues);
                    RequireSafeText(block.Title, $"{path}/title", issues);
                    RequireSafeText(block.Text, $"{path}/text", issues);
                    break;
                case "diagram":
                    RequireSafeText(block.Title, $"{path}/title", issues);
                    RequireSafeText(block.Description, $"{path}/description", issues);
                    RequireSafeText(block.AlternativeText, $"{path}/alternativeText", issues);
                    Require(block.Labels?.Count >= 2, "CIC_REQUIRED", $"{path}/labels", issues);
                    for (var labelIndex = 0; labelIndex < (block.Labels?.Count ?? 0); labelIndex++)
                    {
                        RequireSafeText(
                            block.Labels![labelIndex],
                            $"{path}/labels/{labelIndex}",
                            issues);
                    }
                    break;
                case "codeReference":
                    ValidateCodeReference(
                        block.RepositoryId,
                        block.Path,
                        block.Branch,
                        block.Commit,
                        block.Language,
                        block.StartLine,
                        block.EndLine,
                        block.Symbol,
                        block.Excerpt,
                        block.ContentClassification,
                        block.Provenance,
                        path,
                        repositoryById,
                        issues);
                    RequireSafeText(block.Explanation, $"{path}/explanation", issues);
                    break;
                case "codeTour":
                    RequireSafeText(block.Title, $"{path}/title", issues);
                    var steps = block.Steps ?? [];
                    Require(steps.Count >= 2, "CIC_REQUIRED", $"{path}/steps", issues);
                    for (var stepIndex = 0; stepIndex < steps.Count; stepIndex++)
                    {
                        var step = steps[stepIndex];
                        var stepPath = $"{path}/steps/{stepIndex}";
                        Require(
                            step.Order == stepIndex + 1,
                            "CIC_INVALID_ORDER",
                            $"{stepPath}/order",
                            issues);
                        RequireSafeText(step.Title, $"{stepPath}/title", issues);
                        RequireSafeText(step.Guidance, $"{stepPath}/guidance", issues);
                        ValidateCodeReference(
                            step.RepositoryId,
                            step.Path,
                            step.Branch,
                            step.Commit,
                            step.Language,
                            step.StartLine,
                            step.EndLine,
                            step.Symbol,
                            step.Excerpt,
                            step.ContentClassification,
                            step.Provenance,
                            stepPath,
                            repositoryById,
                            issues);
                    }
                    break;
                case "example":
                    RequireSafeText(block.Title, $"{path}/title", issues);
                    RequireSafeText(block.Text, $"{path}/text", issues);
                    break;
                case "glossaryLink":
                    RequireSafeText(block.Term, $"{path}/term", issues);
                    RequireSafeText(block.Definition, $"{path}/definition", issues);
                    Require(
                        block.Term is not null && terminologyTerms.Contains(block.Term),
                        "CIC_DANGLING_REFERENCE",
                        $"{path}/term",
                        issues);
                    break;
                case "knowledgeCheck":
                    RequireSafeText(block.Prompt, $"{path}/prompt", issues);
                    Require(
                        block.AssessmentId is not null && assessmentIds.Contains(block.AssessmentId),
                        "CIC_DANGLING_REFERENCE",
                        $"{path}/assessmentId",
                        issues);
                    break;
            }
        }
    }

    private static void ValidateCodeReference(
        string? repositoryId,
        string? sourcePath,
        string? branch,
        string? commit,
        string? language,
        int? startLine,
        int? endLine,
        string? symbol,
        string? excerpt,
        string? contentClassification,
        string? provenance,
        string path,
        IReadOnlyDictionary<string, Repository> repositoryById,
        List<ValidationIssue> issues)
    {
        Repository? repository = null;
        var repositoryFound =
            repositoryId is not null
            && repositoryById.TryGetValue(repositoryId, out repository);
        Require(
            repositoryFound,
            "CIC_DANGLING_REPOSITORY",
            $"{path}/repositoryId",
            issues);
        ValidateRelativePath(sourcePath, $"{path}/path", issues);
        Require(
            language is "csharp" or "typescript" or "html" or "scss",
            "CIC_UNSUPPORTED_LANGUAGE",
            $"{path}/language",
            issues);
        Require(
            startLine > 0 && endLine >= startLine,
            "CIC_INVALID_RANGE",
            path,
            issues);
        RequireSafeText(symbol, $"{path}/symbol", issues);
        RequireSafeText(excerpt, $"{path}/excerpt", issues, allowsCodeSyntax: true);
        Require(
            contentClassification is "public" or "internal" or "confidential",
            "CIC_UNSUPPORTED_CLASSIFICATION",
            $"{path}/contentClassification",
            issues);
        RequireSafeText(provenance, $"{path}/provenance", issues);

        if (!repositoryFound)
        {
            return;
        }

        if (!string.IsNullOrWhiteSpace(branch))
        {
            Require(
                string.Equals(branch, repository!.Branch, StringComparison.Ordinal),
                "CIC_REVISION_MISMATCH",
                $"{path}/branch",
                issues);
        }
        if (!string.IsNullOrWhiteSpace(commit))
        {
            Require(
                string.Equals(commit, repository!.Commit, StringComparison.Ordinal)
                    || string.Equals(commit, repository.Revision, StringComparison.Ordinal),
                "CIC_REVISION_MISMATCH",
                $"{path}/commit",
                issues);
        }
    }

    private static void RequireSafeText(
        string? value,
        string path,
        List<ValidationIssue> issues,
        bool allowsCodeSyntax = false)
    {
        Require(!string.IsNullOrWhiteSpace(value), "CIC_REQUIRED", path, issues);
        if (
            !string.IsNullOrWhiteSpace(value)
            && ContainsActiveContent(value, allowsCodeSyntax))
        {
            issues.Add(Issue(
                "CIC_ACTIVE_CONTENT",
                "Active or macro content is not allowed in curriculum blocks.",
                path));
        }
    }

    private static bool ContainsActiveContent(string value, bool allowsCodeSyntax) =>
        Regex.IsMatch(
            value,
            @"<\s*/?\s*(script|iframe|object|embed|form|input|button|style|link|meta|svg|video|audio)\b|javascript\s*:|\bon[a-z]+\s*=|\{\{|\{%|<\?",
            RegexOptions.IgnoreCase | RegexOptions.CultureInvariant,
            TimeSpan.FromMilliseconds(100))
        || (
            !allowsCodeSyntax
            && Regex.IsMatch(
                value,
                @"<\s*/?\s*[a-z][a-z0-9-]*(?:\s+[^>]*)?>",
                RegexOptions.CultureInvariant,
                TimeSpan.FromMilliseconds(100)));

    private static void ValidateAssessments(
        IReadOnlyList<Assessment> assessments,
        HashSet<string> identifiers,
        HashSet<string> learningObjectiveIds,
        HashSet<string> systemIds,
        HashSet<string> subsystemIds,
        List<ValidationIssue> issues)
    {
        for (var assessmentIndex = 0; assessmentIndex < assessments.Count; assessmentIndex++)
        {
            var assessment = assessments[assessmentIndex];
            var assessmentPath = $"/assessments/{assessmentIndex}";
            AddIdentifier(assessment.Id, $"{assessmentPath}/id", identifiers, issues);
            Require(!string.IsNullOrWhiteSpace(assessment.Title), "CIC_REQUIRED", $"{assessmentPath}/title", issues);
            Require(assessment.Purpose is "formative" or "summative", "CIC_UNSUPPORTED_ASSESSMENT", $"{assessmentPath}/purpose", issues);
            Require(assessment.ThresholdPercent is >= 0 and <= 100, "CIC_INVALID_THRESHOLD", $"{assessmentPath}/thresholdPercent", issues);
            Require(assessment.MaximumAttempts > 0, "CIC_INVALID_ATTEMPTS", $"{assessmentPath}/maximumAttempts", issues);
            Require(assessment.TimeLimitMinutes is null or > 0, "CIC_INVALID_DURATION", $"{assessmentPath}/timeLimitMinutes", issues);
            Require(
                assessment.FeedbackRelease is "immediate" or "after-submission" or "after-close" or "never",
                "CIC_UNSUPPORTED_FEEDBACK_RELEASE",
                $"{assessmentPath}/feedbackRelease",
                issues);

            var selection = assessment.Selection;
            Require(selection is not null, "CIC_REQUIRED", $"{assessmentPath}/selection", issues);
            if (selection is not null)
            {
                Require(selection.Mode is "fixed" or "random", "CIC_UNSUPPORTED_SELECTION", $"{assessmentPath}/selection/mode", issues);
                Require(selection.ItemCount > 0, "CIC_INVALID_SELECTION", $"{assessmentPath}/selection/itemCount", issues);
                Require(selection.PoolIds?.Count > 0, "CIC_REQUIRED", $"{assessmentPath}/selection/poolIds", issues);
            }

            var mappings = assessment.Mappings;
            Require(mappings is not null, "CIC_REQUIRED", $"{assessmentPath}/mappings", issues);
            if (mappings is not null)
            {
                Require(mappings.ObjectiveIds?.Count > 0, "CIC_REQUIRED", $"{assessmentPath}/mappings/objectiveIds", issues);
                ValidateReferences(
                    mappings.ObjectiveIds ?? [],
                    learningObjectiveIds,
                    $"{assessmentPath}/mappings/objectiveIds",
                    issues);
                ValidateReferences(mappings.SystemIds ?? [], systemIds, $"{assessmentPath}/mappings/systemIds", issues);
                ValidateReferences(mappings.SubsystemIds ?? [], subsystemIds, $"{assessmentPath}/mappings/subsystemIds", issues);
            }

            var pools = assessment.Pools ?? [];
            Require(pools.Count > 0, "CIC_REQUIRED", $"{assessmentPath}/pools", issues);
            var poolIds = new HashSet<string>(StringComparer.Ordinal);
            for (var poolIndex = 0; poolIndex < pools.Count; poolIndex++)
            {
                var pool = pools[poolIndex];
                var poolPath = $"{assessmentPath}/pools/{poolIndex}";
                AddIdentifier(pool.Id, $"{poolPath}/id", identifiers, issues);
                poolIds.Add(pool.Id);
                Require(!string.IsNullOrWhiteSpace(pool.Title), "CIC_REQUIRED", $"{poolPath}/title", issues);
                var items = pool.Items ?? [];
                Require(items.Count > 0, "CIC_REQUIRED", $"{poolPath}/items", issues);
                for (var itemIndex = 0; itemIndex < items.Count; itemIndex++)
                {
                    var item = items[itemIndex];
                    var itemPath = $"{poolPath}/items/{itemIndex}";
                    AddIdentifier(item.Id, $"{itemPath}/id", identifiers, issues);
                    Require(
                        item.Type is "single-choice" or "multiple-choice" or "true-false" or "short-answer" or "code",
                        "CIC_UNSUPPORTED_ITEM",
                        $"{itemPath}/type",
                        issues);
                    Require(!string.IsNullOrWhiteSpace(item.Prompt), "CIC_REQUIRED", $"{itemPath}/prompt", issues);
                    Require(!string.IsNullOrWhiteSpace(item.Rationale), "CIC_REQUIRED", $"{itemPath}/rationale", issues);
                    Require(item.Grading is not null, "CIC_REQUIRED", $"{itemPath}/grading", issues);
                    if (item.Grading is not null)
                    {
                        Require(!string.IsNullOrWhiteSpace(item.Grading.Strategy), "CIC_REQUIRED", $"{itemPath}/grading/strategy", issues);
                        Require(item.Grading.Points > 0, "CIC_INVALID_POINTS", $"{itemPath}/grading/points", issues);
                    }

                    Require(item.Answer is not null, "CIC_REQUIRED", $"{itemPath}/answer", issues);
                    if (item.Answer is not null)
                    {
                        Require(item.Answer.Visibility == "protected", "CIC_ANSWER_NOT_PROTECTED", $"{itemPath}/answer/visibility", issues);
                        Require(!string.IsNullOrWhiteSpace(item.Answer.Value), "CIC_REQUIRED", $"{itemPath}/answer/value", issues);
                    }
                }
            }

            if (selection is not null)
            {
                ValidateReferences(
                    selection.PoolIds ?? [],
                    poolIds,
                    $"{assessmentPath}/selection/poolIds",
                    issues);
            }
        }
    }

    private static void ValidateLearningObjectives(
        IReadOnlyList<LearningObjective> objectives,
        string path,
        HashSet<string> identifiers,
        HashSet<string> learningObjectiveIds,
        List<ValidationIssue> issues)
    {
        for (var index = 0; index < objectives.Count; index++)
        {
            var objective = objectives[index];
            AddIdentifier(objective.Id, $"{path}/{index}/id", identifiers, issues);
            learningObjectiveIds.Add(objective.Id);
            Require(
                !string.IsNullOrWhiteSpace(objective.Statement),
                "CIC_REQUIRED",
                $"{path}/{index}/statement",
                issues);
        }
    }

    private static void ValidateReferences(
        IReadOnlyList<string> references,
        HashSet<string> targets,
        string path,
        List<ValidationIssue> issues)
    {
        for (var index = 0; index < references.Count; index++)
        {
            Require(
                targets.Contains(references[index]),
                "CIC_DANGLING_REFERENCE",
                $"{path}/{index}",
                issues);
        }
    }

    private static void ValidateRelativePath(
        string? value,
        string path,
        List<ValidationIssue> issues)
    {
        var sourcePath = value ?? string.Empty;
        var isForbiddenPath = IsRootedOnAnyPlatform(sourcePath)
            || sourcePath.Split(['/', '\\'], StringSplitOptions.RemoveEmptyEntries)
                .Contains("..", StringComparer.Ordinal);
        Require(!isForbiddenPath && sourcePath.Length > 0, "CIC_FORBIDDEN_PATH", path, issues);
    }

    private static bool IsRootedOnAnyPlatform(string path) =>
        Path.IsPathRooted(path)
        || path.StartsWith('\\')
        || path.StartsWith('/')
        || (path.Length >= 3
            && char.IsAsciiLetter(path[0])
            && path[1] == ':'
            && path[2] is '\\' or '/');

    private static void AddIdentifier(
        string identifier,
        string path,
        HashSet<string> identifiers,
        List<ValidationIssue> issues)
    {
        if (string.IsNullOrWhiteSpace(identifier))
        {
            issues.Add(Issue("CIC_REQUIRED", "A stable identifier is required.", path));
        }
        else if (!identifiers.Add(identifier))
        {
            issues.Add(Issue("CIC_DUPLICATE_ID", "Stable identifiers must be unique.", path));
        }
    }

    private static void Require(
        bool condition,
        string code,
        string path,
        List<ValidationIssue> issues)
    {
        if (!condition)
        {
            issues.Add(Issue(code, "Package data does not satisfy the curriculum contract.", path));
        }
    }

    private static ValidationIssue Issue(string code, string message, string path) =>
        new(code, "error", true, message, path);
}
