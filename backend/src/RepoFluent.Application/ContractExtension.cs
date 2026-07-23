using System.Text.Json;

namespace RepoFluent.Application;

public sealed record ContractExtension(
    string Namespace,
    string Version,
    bool? Critical,
    JsonElement Data);
