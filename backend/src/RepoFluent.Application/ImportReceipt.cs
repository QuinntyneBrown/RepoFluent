using RepoFluent.Domain;

namespace RepoFluent.Application;

public sealed record ImportReceipt(
    Guid Id,
    string Checksum,
    CurriculumStatus Status,
    string CorrelationId,
    string StatusUrl,
    bool IsReplay);
