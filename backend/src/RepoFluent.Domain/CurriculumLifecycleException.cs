namespace RepoFluent.Domain;

public sealed class CurriculumLifecycleException(string message) : InvalidOperationException(message);
