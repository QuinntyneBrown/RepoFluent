using System.Text;
using System.Text.Json;

namespace RepoFluent.Application;

public static class PackageIntakeScanner
{
    private static readonly UTF8Encoding StrictUtf8 = new(
        encoderShouldEmitUTF8Identifier: false,
        throwOnInvalidBytes: true);

    public static string ReadJson(byte[] bytes)
    {
        if (HasUnsafeSignature(bytes) || bytes.Contains((byte)0))
        {
            throw new WorkflowException(
                400,
                "CLI_UNSAFE_CONTENT",
                "The upload resembles executable or binary content and was rejected.");
        }

        try
        {
            var json = StrictUtf8.GetString(bytes);
            using var document = JsonDocument.Parse(json, new JsonDocumentOptions
            {
                AllowTrailingCommas = false,
                CommentHandling = JsonCommentHandling.Disallow,
                MaxDepth = 128
            });
            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                throw new JsonException();
            }

            return json;
        }
        catch (DecoderFallbackException)
        {
            throw Malformed();
        }
        catch (JsonException)
        {
            throw Malformed();
        }
    }

    public static (string PackageId, string PackageVersion) ReadIdentity(string json)
    {
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;
        var packageId = ReadBoundedString(root, "packageId", 120);
        var packageVersion = ReadBoundedString(root, "version", 40);
        return (packageId, packageVersion);
    }

    private static bool HasUnsafeSignature(byte[] bytes) =>
        bytes.AsSpan().StartsWith("MZ"u8)
        || bytes.AsSpan().StartsWith(new byte[] { 0x7f, (byte)'E', (byte)'L', (byte)'F' })
        || bytes.AsSpan().StartsWith(new byte[] { 0x50, 0x4b, 0x03, 0x04 })
        || bytes.AsSpan().StartsWith("%PDF"u8);

    private static WorkflowException Malformed() => new(
        400,
        "CLI_MALFORMED_PACKAGE",
        "The upload is not a well-formed UTF-8 JSON object.");

    private static string ReadBoundedString(
        JsonElement root,
        string propertyName,
        int maximumLength)
    {
        if (!root.TryGetProperty(propertyName, out var value)
            || value.ValueKind != JsonValueKind.String)
        {
            return string.Empty;
        }

        var text = value.GetString() ?? string.Empty;
        return text.Length <= maximumLength ? text : string.Empty;
    }
}
