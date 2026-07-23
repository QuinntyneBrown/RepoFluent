using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using RepoFluent.Application;

namespace RepoFluent.Api;

public sealed class ContractReleaseCatalog
{
    private readonly string contractRoot =
        Path.Combine(AppContext.BaseDirectory, "contracts", "curriculum");

    public ContractReleaseView GetRelease(string version)
    {
        using var manifest = OpenVerifiedManifest(version);
        var root = manifest.RootElement;
        var compatibilityPath = Path.Combine(contractRoot, version, "compatibility.json");
        using var compatibility = JsonDocument.Parse(File.ReadAllBytes(compatibilityPath));
        var compatibilityRoot = compatibility.RootElement;
        var semanticVersion = compatibilityRoot.GetProperty("semanticVersion");
        var backward = compatibilityRoot.GetProperty("backwardCompatibility");
        var forward = compatibilityRoot.GetProperty("forwardCompatibility");
        var unsupported = compatibilityRoot.GetProperty("unsupportedVersions");
        var migration = compatibilityRoot.GetProperty("migration");
        var fixtureSummary = root.GetProperty("fixtureSummary");

        return new(
            root.GetProperty("contract").GetString()!,
            version,
            root.GetProperty("status").GetString()!,
            root.GetProperty("publishedAt").GetDateTimeOffset(),
            root.GetProperty("checksumAlgorithm").GetString()!,
            root.GetProperty("releaseChecksum").GetString()!,
            root.GetProperty("artifacts")
                .EnumerateArray()
                .Select(artifact => new ContractArtifactView(
                    artifact.GetProperty("name").GetString()!,
                    artifact.GetProperty("path").GetString()!,
                    artifact.GetProperty("mediaType").GetString()!,
                    $"sha256:{artifact.GetProperty("sha256").GetString()}",
                    BuildArtifactUrl(version, artifact.GetProperty("path").GetString()!)))
                .ToArray(),
            new(
                compatibilityRoot.GetProperty("supportedVersionWindow")
                    .GetProperty("expression")
                    .GetString()!,
                new Dictionary<string, string>(StringComparer.Ordinal)
                {
                    ["major"] = semanticVersion.GetProperty("major").GetString()!,
                    ["minor"] = semanticVersion.GetProperty("minor").GetString()!,
                    ["patch"] = semanticVersion.GetProperty("patch").GetString()!
                },
                backward.GetProperty("status").GetString()!,
                backward.GetProperty("policy").GetString()!,
                forward.GetProperty("status").GetString()!,
                forward.GetProperty("policy").GetString()!,
                compatibilityRoot.GetProperty("deprecationNoticeDays").GetInt32(),
                unsupported.GetProperty("issueCode").GetString()!,
                unsupported.GetProperty("major").GetString()!,
                unsupported.GetProperty("minor").GetString()!,
                migration.GetProperty("responsibility").GetString()!,
                migration.GetProperty("preserves")
                    .EnumerateArray()
                    .Select(item => item.GetString()!)
                    .ToArray(),
                migration.GetProperty("lossBehavior").GetString()!,
                migration.GetProperty("policy").GetString()!),
            new(
                fixtureSummary.GetProperty("total").GetInt32(),
                fixtureSummary.GetProperty("successful").GetInt32(),
                fixtureSummary.GetProperty("expectedFailures").GetInt32(),
                fixtureSummary.GetProperty("categories")
                    .EnumerateArray()
                    .Select(item => item.GetString()!)
                    .ToArray()));
    }

    public ContractArtifact GetArtifact(string version, string artifactPath)
    {
        using var manifest = OpenVerifiedManifest(version);
        var normalizedPath = artifactPath.Replace('\\', '/');
        var artifact = manifest.RootElement.GetProperty("artifacts")
            .EnumerateArray()
            .FirstOrDefault(
                item => string.Equals(
                    item.GetProperty("path").GetString(),
                    normalizedPath,
                    StringComparison.Ordinal));
        if (artifact.ValueKind == JsonValueKind.Undefined)
        {
            throw new WorkflowException(
                404,
                "CIC_CONTRACT_ARTIFACT_NOT_FOUND",
                "The requested contract artifact is not part of this release.");
        }

        var releaseRoot = Path.Combine(contractRoot, version);
        var fullPath = ResolveArtifactPath(releaseRoot, normalizedPath);
        return new(
            normalizedPath,
            artifact.GetProperty("mediaType").GetString()!,
            File.ReadAllBytes(fullPath));
    }

    private JsonDocument OpenVerifiedManifest(string version)
    {
        if (!Regex.IsMatch(version, @"^\d+\.\d+\.\d+$", RegexOptions.CultureInvariant))
        {
            throw UnsupportedVersion();
        }

        var releaseRoot = Path.Combine(contractRoot, version);
        var manifestPath = Path.Combine(releaseRoot, "release-manifest.json");
        if (!File.Exists(manifestPath))
        {
            throw UnsupportedVersion();
        }

        var manifest = JsonDocument.Parse(File.ReadAllBytes(manifestPath));
        try
        {
            var root = manifest.RootElement;
            if (!string.Equals(
                root.GetProperty("version").GetString(),
                version,
                StringComparison.Ordinal))
            {
                throw InvalidRelease("The manifest version does not match its release path.");
            }

            var checksums = new List<(string Path, string Checksum)>();
            foreach (var artifact in root.GetProperty("artifacts").EnumerateArray())
            {
                var artifactPath = artifact.GetProperty("path").GetString()!;
                var fullPath = ResolveArtifactPath(releaseRoot, artifactPath);
                if (!File.Exists(fullPath))
                {
                    throw InvalidRelease($"Contract artifact {artifactPath} is absent.");
                }

                var checksum = Convert.ToHexStringLower(SHA256.HashData(File.ReadAllBytes(fullPath)));
                if (!string.Equals(
                    checksum,
                    artifact.GetProperty("sha256").GetString(),
                    StringComparison.Ordinal))
                {
                    throw InvalidRelease($"Contract artifact {artifactPath} failed checksum verification.");
                }

                checksums.Add((artifactPath, checksum));
            }

            var checksumInput = new StringBuilder();
            foreach (var item in checksums.OrderBy(item => item.Path, StringComparer.Ordinal))
            {
                checksumInput.Append(item.Path).Append(':').Append(item.Checksum).Append('\n');
            }

            var releaseChecksum = Convert.ToHexStringLower(
                SHA256.HashData(Encoding.UTF8.GetBytes(checksumInput.ToString())));
            if (!string.Equals(
                root.GetProperty("releaseChecksum").GetString(),
                $"sha256:{releaseChecksum}",
                StringComparison.Ordinal))
            {
                throw InvalidRelease("The contract release checksum is invalid.");
            }

            return manifest;
        }
        catch
        {
            manifest.Dispose();
            throw;
        }
    }

    private static string ResolveArtifactPath(string releaseRoot, string artifactPath)
    {
        var normalizedPath = artifactPath.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(releaseRoot, normalizedPath));
        var normalizedRoot = Path.GetFullPath(releaseRoot) + Path.DirectorySeparatorChar;
        if (!fullPath.StartsWith(normalizedRoot, StringComparison.Ordinal))
        {
            throw new WorkflowException(
                400,
                "CIC_CONTRACT_ARTIFACT_PATH",
                "The contract artifact path is outside its release.");
        }
        return fullPath;
    }

    private static string BuildArtifactUrl(string version, string artifactPath) =>
        $"/api/contracts/curriculum/releases/{Uri.EscapeDataString(version)}/artifacts/"
        + string.Join('/', artifactPath.Split('/').Select(Uri.EscapeDataString));

    private static WorkflowException UnsupportedVersion() =>
        new(
            404,
            "CIC_CONTRACT_VERSION_UNSUPPORTED",
            "The requested curriculum contract release is outside the published version window.");

    private static WorkflowException InvalidRelease(string message) =>
        new(500, "CIC_CONTRACT_RELEASE_INVALID", message);
}
