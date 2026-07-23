namespace RepoFluent.Application;

public sealed record LearningObjective(string Id, string Statement)
{
    public EvidenceMetadata? Evidence { get; init; }
}
