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

## Provenance and uncertainty

Optional `evidence` metadata is available at package level and on learning
objectives, lesson blocks, and assessment items. When present it declares one
confidence state (`high`, `medium`, `low`, or `unknown`), one or more citations,
and explicit arrays for assumptions, omissions, conflicting sources, and
unresolved questions. Empty uncertainty arrays mean that the producer declared
none; they do not mean that the validator inferred certainty.

Each citation resolves `sourceId` to a repository in the package source
snapshot and `document` to one of that repository's declared documents. The
locator is snapshot-relative text interpreted by the cited document format.
`evidenceType` distinguishes `direct` evidence from `synthesis` and
`interpretation`. Consumers must preserve those labels and must not present
assumptions, conflicts, omissions, or unresolved questions as verified facts.

## Stable identifiers

Identifiers are package-local, globally unique ASCII lowercase kebab case,
between one and 120 characters. A duplicate reports every colliding JSON
Pointer. Typed references resolve only to compatible declared target sets.

Producers derive an identifier from stable semantic scope such as entity kind,
repository-relative source key, and symbol—not display title or generated
prose. Generation lowercases ASCII, replaces each punctuation/whitespace run
with one hyphen, collapses repeated hyphens, and trims edge hyphens. A collision
uses a deterministic suffix derived from the same stable source key. Regeneration
with unchanged semantic scope therefore retains identity even when wording
changes.

## Canonical primitive formats

- Contract files are UTF-8 JSON with media type `application/json`; canonical
  checksum input has no byte-order mark.
- Date/time values are RFC 3339 UTC strings using uppercase `T` and a `Z`
  suffix, for example `2026-07-23T12:00:00Z`. Numeric offsets are semantically
  convertible but are not canonical package values.
- Durations use positive integer minutes in fields whose names end in
  `Minutes`. They are not ISO 8601 duration strings.
- Artifact digests are 64 lowercase hexadecimal SHA-256 characters. Aggregate
  release checksums use `sha256:` followed by that representation.
- Supported package locales are the case-sensitive values `en-CA` and `en-US`.
- Enumerations are closed and case-sensitive.
- `null` is valid only where the schema explicitly includes it. An omitted
  optional property has no value. Validators apply no implicit defaults.
- JSON object member order carries no meaning. Release checksum normalization
  is the path-and-digest procedure declared by `release-manifest.json`.

## Conformance

`fixtures/conformance-catalog.json` declares two successful fixtures and eight
expected failures. Each expected failure names its category, mutation, outcome,
and stable issue code. The release verifier checks fixture inventory and
artifact digests; backend tests execute every fixture case through the package
validator.
