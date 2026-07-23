# Curriculum Input Contract interface control document

Contract version: `0.1.0`

Release status: prerelease

## Release boundary

A release is the immutable, checksummed collection declared by
`release-manifest.json`. Consumers retrieve artifacts by release-relative path.
No model vendor, agent runtime, or authoring product is required to read JSON
Schema, compatibility, validation codes, fixtures, or release notes.

## Semantic version meaning

- **Major** changes alter required shape or meaning and require an explicit
  migration.
- **Minor** changes are backward-compatible additions. Existing required
  semantics retain their meaning.
- **Patch** changes clarify documentation, correct fixtures, or fix validation
  without changing accepted semantics.

The supported version window is `>=0.1.0 <0.2.0`.

## Compatibility

The `0.1.x` line is backward compatible with packages produced for `0.1.0`
while required semantics remain unchanged. Forward compatibility is bounded:
consumers may ignore only declared optional extensions. Unknown required
semantics are rejected.

Unsupported major and minor versions fail before import with
`CIC_UNSUPPORTED_VERSION` and identify the supported window. A release receives
at least 180 days of deprecation notice before support is removed.

## Migration responsibility

Contract maintainers own version migrations. A migration preserves stable
identifiers and protected semantics. If loss cannot be avoided, migration stops
before publication and returns a path-addressed loss report. It does not
silently regenerate identifiers, disclose protected answers, or downgrade
protected content.

## Safe content and code references

Lesson blocks use the closed discriminator set `prose`, `callout`, `diagram`,
`codeReference`, `codeTour`, `example`, `glossaryLink`, and `knowledgeCheck`.
Renderers treat supplied values as text and preserve required diagram
descriptions. Active HTML, script, executable and macro content is blocked at
its exact property path. A remote resource is invalid unless a future approved
extension declares its namespace, criticality, integrity, and retrieval policy.

Code paths are relative to a declared repository. A reference may bind its
declared branch and commit and carries language, symbol, line range, supplied
excerpt, content classification, explanation, and provenance. A code tour has
at least two consecutively ordered steps. Every step repeats enough
revision-bound reference metadata to validate and render offline without a
repository provider.

## Conformance

`fixtures/conformance-catalog.json` declares two successful fixtures and eight
expected failures. Each expected failure names its category, mutation, outcome,
and stable issue code. The release verifier checks fixture inventory and
artifact digests; backend tests execute every fixture case through the package
validator.
