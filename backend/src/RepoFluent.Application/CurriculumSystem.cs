namespace RepoFluent.Application;

public sealed record CurriculumSystem(
    string Id,
    string Name,
    string Responsibility,
    string Boundary,
    IReadOnlyList<CurriculumSubsystem> Subsystems);
