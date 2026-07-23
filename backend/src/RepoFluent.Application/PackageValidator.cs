using System.Text.Json;

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
        Require(!string.IsNullOrWhiteSpace(package.Title), "CIC_REQUIRED", "/title", issues);
        Require(package.SourceSnapshot?.Repositories?.Count > 0, "CIC_REQUIRED", "/sourceSnapshot/repositories", issues);
        Require(package.Courses?.Count > 0, "CIC_REQUIRED", "/courses", issues);

        var identifiers = new HashSet<string>(StringComparer.Ordinal);
        var repositories = package.SourceSnapshot?.Repositories ?? [];
        for (var repositoryIndex = 0; repositoryIndex < repositories.Count; repositoryIndex++)
        {
            AddIdentifier(repositories[repositoryIndex].Id, $"/sourceSnapshot/repositories/{repositoryIndex}/id", identifiers, issues);
        }

        var repositoryIds = repositories.Select(repository => repository.Id).ToHashSet(StringComparer.Ordinal);
        var courses = package.Courses ?? [];
        for (var courseIndex = 0; courseIndex < courses.Count; courseIndex++)
        {
            var course = courses[courseIndex];
            AddIdentifier(course.Id, $"/courses/{courseIndex}/id", identifiers, issues);
            Require(course.Modules?.Count > 0, "CIC_REQUIRED", $"/courses/{courseIndex}/modules", issues);
            var modules = course.Modules ?? [];
            for (var moduleIndex = 0; moduleIndex < modules.Count; moduleIndex++)
            {
                var module = modules[moduleIndex];
                AddIdentifier(module.Id, $"/courses/{courseIndex}/modules/{moduleIndex}/id", identifiers, issues);
                var lessons = module.Lessons ?? [];
                for (var lessonIndex = 0; lessonIndex < lessons.Count; lessonIndex++)
                {
                    var lesson = lessons[lessonIndex];
                    var lessonPath = $"/courses/{courseIndex}/modules/{moduleIndex}/lessons/{lessonIndex}";
                    AddIdentifier(lesson.Id, $"{lessonPath}/id", identifiers, issues);
                    Require(lesson.Blocks?.Count > 0, "CIC_REQUIRED", $"{lessonPath}/blocks", issues);
                    ValidateBlocks(lesson.Blocks ?? [], lessonPath, repositoryIds, issues);
                }
            }
        }

        return (package, issues.OrderBy(issue => issue.Path, StringComparer.Ordinal).ThenBy(issue => issue.Code, StringComparer.Ordinal).ToArray());
    }

    public static Package ReadTrusted(string json) =>
        JsonSerializer.Deserialize<Package>(json, SerializerOptions)
        ?? throw new InvalidOperationException("Stored curriculum package could not be read.");

    private static void ValidateBlocks(
        IReadOnlyList<Block> blocks,
        string lessonPath,
        HashSet<string> repositoryIds,
        List<ValidationIssue> issues)
    {
        for (var blockIndex = 0; blockIndex < blocks.Count; blockIndex++)
        {
            var block = blocks[blockIndex];
            var path = $"{lessonPath}/blocks/{blockIndex}";
            if (block.Type is not ("prose" or "callout" or "codeReference"))
            {
                issues.Add(Issue("CIC_UNSUPPORTED_BLOCK", "Content block type is not supported.", $"{path}/type"));
                continue;
            }

            if (block.Type is "prose" or "callout")
            {
                Require(!string.IsNullOrWhiteSpace(block.Text), "CIC_REQUIRED", $"{path}/text", issues);
            }

            if (block.Type != "codeReference")
            {
                continue;
            }

            Require(
                block.RepositoryId is not null && repositoryIds.Contains(block.RepositoryId),
                "CIC_DANGLING_REPOSITORY",
                $"{path}/repositoryId",
                issues);
            var sourcePath = block.Path ?? string.Empty;
            var isForbiddenPath = Path.IsPathRooted(sourcePath)
                || sourcePath.Split(['/', '\\'], StringSplitOptions.RemoveEmptyEntries).Contains("..", StringComparer.Ordinal);
            Require(!isForbiddenPath && sourcePath.Length > 0, "CIC_FORBIDDEN_PATH", $"{path}/path", issues);
            Require(block.StartLine > 0 && block.EndLine >= block.StartLine, "CIC_INVALID_RANGE", path, issues);
        }
    }

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
