namespace RepoFluent.Application;

public sealed record ContractFixtureSummary(
    int Total,
    int Successful,
    int ExpectedFailures,
    IReadOnlyList<string> Categories);
