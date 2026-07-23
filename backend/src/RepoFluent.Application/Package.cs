namespace RepoFluent.Application;

public sealed record Package(
    string ContractVersion,
    string PackageId,
    string Version,
    string Title,
    string Description,
    string Owner,
    string Locale,
    SourceSnapshot SourceSnapshot,
    IReadOnlyList<Course> Courses);
