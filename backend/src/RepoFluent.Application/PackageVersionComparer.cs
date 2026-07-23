using System.Text.Json;
using System.Text.RegularExpressions;

namespace RepoFluent.Application;

public sealed partial class PackageVersionComparer
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public static VersionComparison Compare(
        Guid baseVersionId,
        Package baseline,
        Guid targetVersionId,
        Package target)
    {
        var changes = new List<VersionChange>();
        AddTextChange(
            changes,
            "package",
            target.PackageId,
            "Package title",
            baseline.Title,
            target.Title,
            []);
        CompareSources(changes, baseline, target);
        CompareCourses(changes, baseline, target);
        CompareAssessments(changes, baseline, target);
        FindUnresolvedReferences(changes, target);

        var orderedChanges = changes
            .OrderBy(change => change.Classification, StringComparer.Ordinal)
            .ThenBy(change => change.EntityType, StringComparer.Ordinal)
            .ThenBy(change => change.EntityId, StringComparer.Ordinal)
            .ToList();
        var affectedObjectives = orderedChanges
            .SelectMany(change => change.AffectedObjectiveIds)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(id => id, StringComparer.Ordinal)
            .ToList();
        return new(
            baseVersionId,
            targetVersionId,
            target.PackageId,
            baseline.Version,
            target.Version,
            orderedChanges,
            affectedObjectives,
            orderedChanges.Any(change => change.LearnerRefreshRequired));
    }

    private static void CompareSources(
        ICollection<VersionChange> changes,
        Package baseline,
        Package target)
    {
        var baselineRepositories = baseline.SourceSnapshot.Repositories.ToDictionary(item => item.Id);
        var targetRepositories = target.SourceSnapshot.Repositories.ToDictionary(item => item.Id);
        var affectedObjectives = AllObjectiveIds(target);
        foreach (var id in baselineRepositories.Keys
                     .Union(targetRepositories.Keys, StringComparer.Ordinal)
                     .OrderBy(value => value, StringComparer.Ordinal))
        {
            if (!baselineRepositories.TryGetValue(id, out var previous))
            {
                Add(changes, "Added", "source repository", id, "Source repository added.", affectedObjectives);
            }
            else if (!targetRepositories.TryGetValue(id, out var current))
            {
                Add(changes, "Removed", "source repository", id, "Source repository removed.", affectedObjectives);
            }
            else if (!JsonEquals(previous, current))
            {
                Add(
                    changes,
                    "Source changed",
                    "source repository",
                    id,
                    $"Source snapshot moved from {previous.Commit ?? previous.Revision} to {current.Commit ?? current.Revision}.",
                    affectedObjectives);
            }
        }
    }

    private static void CompareCourses(
        ICollection<VersionChange> changes,
        Package baseline,
        Package target)
    {
        var baselineCourses = baseline.Courses.ToDictionary(item => item.Id);
        var targetCourses = target.Courses.ToDictionary(item => item.Id);
        foreach (var id in baselineCourses.Keys
                     .Union(targetCourses.Keys, StringComparer.Ordinal)
                     .OrderBy(value => value, StringComparer.Ordinal))
        {
            if (!baselineCourses.TryGetValue(id, out var previous))
            {
                Add(changes, "Added", "course", id, "Course added.", ObjectiveIds(targetCourses[id]));
                continue;
            }

            if (!targetCourses.TryGetValue(id, out var current))
            {
                Add(changes, "Removed", "course", id, "Course removed.", ObjectiveIds(previous));
                continue;
            }

            var affectedObjectives = ObjectiveIds(current);
            AddTextChange(
                changes,
                "course",
                id,
                "Course title",
                previous.Title,
                current.Title,
                affectedObjectives);
            if (previous.Order != current.Order)
            {
                Add(changes, "Reordered", "course", id, "Course order changed.", affectedObjectives);
            }

            CompareModules(changes, previous, current);
        }
    }

    private static void CompareModules(
        ICollection<VersionChange> changes,
        Course baseline,
        Course target)
    {
        var baselineModules = baseline.Modules.ToDictionary(item => item.Id);
        var targetModules = target.Modules.ToDictionary(item => item.Id);
        var affectedObjectives = ObjectiveIds(target);
        foreach (var id in baselineModules.Keys
                     .Union(targetModules.Keys, StringComparer.Ordinal)
                     .OrderBy(value => value, StringComparer.Ordinal))
        {
            if (!baselineModules.TryGetValue(id, out var previous))
            {
                Add(changes, "Added", "module", id, "Module added.", affectedObjectives);
                continue;
            }

            if (!targetModules.TryGetValue(id, out var current))
            {
                Add(changes, "Removed", "module", id, "Module removed.", affectedObjectives);
                continue;
            }

            AddTextChange(
                changes,
                "module",
                id,
                "Module title",
                previous.Title,
                current.Title,
                affectedObjectives);
            if (previous.Order != current.Order)
            {
                Add(changes, "Reordered", "module", id, "Module order changed.", affectedObjectives);
            }

            CompareLessons(changes, previous, current, affectedObjectives);
        }
    }

    private static void CompareLessons(
        ICollection<VersionChange> changes,
        CourseModule baseline,
        CourseModule target,
        IReadOnlyList<string> affectedObjectives)
    {
        var baselineLessons = baseline.Lessons.ToDictionary(item => item.Id);
        var targetLessons = target.Lessons.ToDictionary(item => item.Id);
        foreach (var id in baselineLessons.Keys
                     .Union(targetLessons.Keys, StringComparer.Ordinal)
                     .OrderBy(value => value, StringComparer.Ordinal))
        {
            if (!baselineLessons.TryGetValue(id, out var previous))
            {
                Add(changes, "Added", "lesson", id, "Lesson added.", affectedObjectives);
                continue;
            }

            if (!targetLessons.TryGetValue(id, out var current))
            {
                Add(changes, "Removed", "lesson", id, "Lesson removed.", affectedObjectives);
                continue;
            }

            AddTextChange(
                changes,
                "lesson",
                id,
                "Lesson title",
                previous.Title,
                current.Title,
                affectedObjectives);
            if (previous.Order != current.Order)
            {
                Add(changes, "Reordered", "lesson", id, "Lesson order changed.", affectedObjectives);
            }

            if (!JsonEquals(previous.Objectives, current.Objectives)
                || !JsonEquals(previous.Blocks, current.Blocks))
            {
                Add(
                    changes,
                    "Modified",
                    "lesson",
                    id,
                    "Lesson objectives or content changed.",
                    affectedObjectives);
            }
        }
    }

    private static void CompareAssessments(
        ICollection<VersionChange> changes,
        Package baseline,
        Package target)
    {
        var baselineAssessments = baseline.Assessments.ToDictionary(item => item.Id);
        var targetAssessments = target.Assessments.ToDictionary(item => item.Id);
        foreach (var id in baselineAssessments.Keys
                     .Union(targetAssessments.Keys, StringComparer.Ordinal)
                     .OrderBy(value => value, StringComparer.Ordinal))
        {
            if (!baselineAssessments.TryGetValue(id, out var previous))
            {
                Add(
                    changes,
                    "Added",
                    "assessment",
                    id,
                    "Assessment added.",
                    targetAssessments[id].Mappings.ObjectiveIds);
                continue;
            }

            if (!targetAssessments.TryGetValue(id, out var current))
            {
                Add(
                    changes,
                    "Removed",
                    "assessment",
                    id,
                    "Assessment removed.",
                    previous.Mappings.ObjectiveIds);
                continue;
            }

            var baselineItems = previous.Pools
                .SelectMany(pool => pool.Items)
                .ToDictionary(item => item.Id);
            var targetItems = current.Pools
                .SelectMany(pool => pool.Items)
                .ToDictionary(item => item.Id);
            var assessmentChanged = !JsonEquals(previous.Selection, current.Selection)
                || previous.ThresholdPercent != current.ThresholdPercent
                || previous.MaximumAttempts != current.MaximumAttempts
                || previous.TimeLimitMinutes != current.TimeLimitMinutes
                || !JsonEquals(previous.Mappings, current.Mappings);
            foreach (var itemId in baselineItems.Keys
                         .Union(targetItems.Keys, StringComparer.Ordinal)
                         .OrderBy(value => value, StringComparer.Ordinal))
            {
                if (!baselineItems.TryGetValue(itemId, out var previousItem))
                {
                    Add(
                        changes,
                        "Added",
                        "assessment item",
                        itemId,
                        "Assessment item added.",
                        current.Mappings.ObjectiveIds);
                    assessmentChanged = true;
                }
                else if (!targetItems.TryGetValue(itemId, out var currentItem))
                {
                    Add(
                        changes,
                        "Removed",
                        "assessment item",
                        itemId,
                        "Assessment item removed.",
                        previous.Mappings.ObjectiveIds);
                    assessmentChanged = true;
                }
                else if (!JsonEquals(previousItem, currentItem))
                {
                    assessmentChanged = true;
                }
            }

            if (assessmentChanged)
            {
                Add(
                    changes,
                    "Assessment changed",
                    "assessment",
                    id,
                    "Assessment configuration or question content changed.",
                    current.Mappings.ObjectiveIds
                        .Union(previous.Mappings.ObjectiveIds, StringComparer.Ordinal)
                        .ToList());
            }
        }
    }

    private static void FindUnresolvedReferences(
        ICollection<VersionChange> changes,
        Package target)
    {
        var repositories = target.SourceSnapshot.Repositories
            .Select(item => item.Id)
            .ToHashSet(StringComparer.Ordinal);
        var objectives = AllObjectiveIds(target).ToHashSet(StringComparer.Ordinal);
        foreach (var lesson in target.Courses.SelectMany(course =>
                     course.Modules.SelectMany(module => module.Lessons)))
        {
            foreach (var repositoryId in lesson.Blocks
                         .Where(block => block.RepositoryId is not null)
                         .Select(block => block.RepositoryId!)
                         .Where(repositoryId => !repositories.Contains(repositoryId))
                         .Distinct(StringComparer.Ordinal))
            {
                Add(
                    changes,
                    "Unresolved reference",
                    "lesson",
                    lesson.Id,
                    $"Repository reference '{repositoryId}' cannot be resolved.",
                    lesson.Objectives.Select(item => item.Id).ToList());
            }
        }

        foreach (var assessment in target.Assessments)
        {
            foreach (var objectiveId in assessment.Mappings.ObjectiveIds
                         .Where(objectiveId => !objectives.Contains(objectiveId)))
            {
                Add(
                    changes,
                    "Unresolved reference",
                    "assessment",
                    assessment.Id,
                    $"Objective reference '{objectiveId}' cannot be resolved.",
                    [objectiveId]);
            }

            var poolIds = assessment.Pools.Select(pool => pool.Id).ToHashSet(StringComparer.Ordinal);
            foreach (var poolId in assessment.Selection.PoolIds.Where(poolId => !poolIds.Contains(poolId)))
            {
                Add(
                    changes,
                    "Unresolved reference",
                    "assessment",
                    assessment.Id,
                    $"Question-pool reference '{poolId}' cannot be resolved.",
                    assessment.Mappings.ObjectiveIds);
            }
        }
    }

    private static void AddTextChange(
        ICollection<VersionChange> changes,
        string entityType,
        string entityId,
        string label,
        string baseline,
        string target,
        IReadOnlyList<string> affectedObjectives)
    {
        if (string.Equals(baseline, target, StringComparison.Ordinal))
        {
            return;
        }

        var presentational = string.Equals(
            NormalizeText(baseline),
            NormalizeText(target),
            StringComparison.Ordinal);
        Add(
            changes,
            presentational ? "Presentational" : "Modified",
            entityType,
            entityId,
            presentational
                ? $"{label} changed without changing its meaning."
                : $"{label} changed semantically.",
            affectedObjectives,
            !presentational);
    }

    private static void Add(
        ICollection<VersionChange> changes,
        string classification,
        string entityType,
        string entityId,
        string description,
        IReadOnlyList<string> affectedObjectives,
        bool learnerRefreshRequired = true) =>
        changes.Add(
            new(
                classification,
                entityType,
                entityId,
                description,
                affectedObjectives
                    .Distinct(StringComparer.Ordinal)
                    .OrderBy(id => id, StringComparer.Ordinal)
                    .ToList(),
                learnerRefreshRequired));

    private static IReadOnlyList<string> ObjectiveIds(Course course) =>
        course.Objectives
            .Select(item => item.Id)
            .Concat(
                course.Modules.SelectMany(module =>
                    module.Lessons.SelectMany(lesson =>
                        lesson.Objectives.Select(item => item.Id))))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(id => id, StringComparer.Ordinal)
            .ToList();

    private static List<string> AllObjectiveIds(Package package) =>
        package.Courses
            .SelectMany(ObjectiveIds)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(id => id, StringComparer.Ordinal)
            .ToList();

    private static bool JsonEquals<T>(T baseline, T target) =>
        string.Equals(
            JsonSerializer.Serialize(baseline, SerializerOptions),
            JsonSerializer.Serialize(target, SerializerOptions),
            StringComparison.Ordinal);

    private static string NormalizeText(string value) =>
        NonWordCharacters().Replace(value, string.Empty).ToUpperInvariant();

    [GeneratedRegex(@"[^\p{L}\p{N}]+", RegexOptions.CultureInvariant)]
    private static partial Regex NonWordCharacters();
}
