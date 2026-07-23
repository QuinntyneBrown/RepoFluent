using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using RepoFluent.Application;

namespace RepoFluent.Api;

public sealed class AuthoringKitReleaseCatalog
{
    private readonly string releaseRoot =
        Path.Combine(AppContext.BaseDirectory, "authoring-kits");

    public AuthoringKitReleaseView GetRelease(string version)
    {
        using var manifest = OpenVerifiedManifest(version);
        var root = manifest.RootElement;
        var runtime = root.GetProperty("runtime");
        var offline = root.GetProperty("offline");

        return new(
            root.GetProperty("kit").GetString()!,
            version,
            root.GetProperty("contractVersion").GetString()!,
            root.GetProperty("validatorVersion").GetString()!,
            root.GetProperty("status").GetString()!,
            root.GetProperty("publishedAt").GetDateTimeOffset(),
            $"{runtime.GetProperty("name").GetString()} {runtime.GetProperty("version").GetString()}",
            root.GetProperty("releaseChecksum").GetString()!,
            new(
                offline.GetProperty("supported").GetBoolean(),
                offline.GetProperty("validationRequiresNetwork").GetBoolean(),
                offline.GetProperty("optionalNetworkFeaturesEnabledByDefault").GetBoolean(),
                offline.GetProperty("optionalNetworkFeatures")
                    .EnumerateArray()
                    .Select(item => item.GetString()!)
                    .ToArray()),
            root.GetProperty("artifacts")
                .EnumerateArray()
                .Select(artifact => new AuthoringKitArtifactView(
                    artifact.GetProperty("name").GetString()!,
                    artifact.GetProperty("path").GetString()!,
                    artifact.GetProperty("mediaType").GetString()!,
                    $"sha256:{artifact.GetProperty("sha256").GetString()}",
                    BuildArtifactUrl(version, artifact.GetProperty("path").GetString()!)))
                .ToArray());
    }

    public AuthoringKitArtifact GetArtifact(string version, string artifactPath)
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
                "AAK_ARTIFACT_NOT_FOUND",
                "The requested artifact is not part of this authoring-kit release.");
        }

        var fullPath = ResolveArtifactPath(
            Path.Combine(releaseRoot, version),
            normalizedPath);
        return new(
            normalizedPath,
            artifact.GetProperty("mediaType").GetString()!,
            File.ReadAllBytes(fullPath));
    }

    private JsonDocument OpenVerifiedManifest(string version)
    {
        if (!Regex.IsMatch(version, @"^\d+\.\d+\.\d+$", RegexOptions.CultureInvariant))
        {
            throw ReleaseNotFound();
        }

        var versionRoot = Path.Combine(releaseRoot, version);
        var manifestPath = Path.Combine(versionRoot, "manifest.json");
        if (!File.Exists(manifestPath))
        {
            throw ReleaseNotFound();
        }

        var manifest = JsonDocument.Parse(File.ReadAllBytes(manifestPath));
        try
        {
            var root = manifest.RootElement;
            if (!string.Equals(
                root.GetProperty("kitVersion").GetString(),
                version,
                StringComparison.Ordinal))
            {
                throw InvalidRelease("The manifest version does not match its release path.");
            }

            var checksums = new List<(string Path, string Checksum)>();
            foreach (var artifact in root.GetProperty("artifacts").EnumerateArray())
            {
                var artifactPath = artifact.GetProperty("path").GetString()!;
                var fullPath = ResolveArtifactPath(versionRoot, artifactPath);
                if (!File.Exists(fullPath))
                {
                    throw InvalidRelease($"Authoring-kit artifact {artifactPath} is absent.");
                }

                var checksum = Convert.ToHexStringLower(SHA256.HashData(File.ReadAllBytes(fullPath)));
                if (!string.Equals(
                    checksum,
                    artifact.GetProperty("sha256").GetString(),
                    StringComparison.Ordinal))
                {
                    throw InvalidRelease($"Authoring-kit artifact {artifactPath} failed checksum verification.");
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
                throw InvalidRelease("The authoring-kit release checksum is invalid.");
            }

            return manifest;
        }
        catch
        {
            manifest.Dispose();
            throw;
        }
    }

    private static string ResolveArtifactPath(string versionRoot, string artifactPath)
    {
        var normalizedPath = artifactPath.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(versionRoot, normalizedPath));
        var normalizedRoot = Path.GetFullPath(versionRoot) + Path.DirectorySeparatorChar;
        if (!fullPath.StartsWith(normalizedRoot, StringComparison.Ordinal))
        {
            throw new WorkflowException(
                400,
                "AAK_ARTIFACT_PATH",
                "The authoring-kit artifact path is outside its release.");
        }
        return fullPath;
    }

    private static string BuildArtifactUrl(string version, string artifactPath) =>
        $"/api/authoring-kits/releases/{Uri.EscapeDataString(version)}/artifacts/"
        + string.Join('/', artifactPath.Split('/').Select(Uri.EscapeDataString));

    private static WorkflowException ReleaseNotFound() =>
        new(
            404,
            "AAK_RELEASE_NOT_FOUND",
            "The requested authoring-kit release is not published.");

    private static WorkflowException InvalidRelease(string message) =>
        new(500, "AAK_RELEASE_INVALID", message);
}
