# Curriculum contract 0.1.0

This prerelease contract is the bounded input for RepoFluent's first
curriculum-to-learning vertical slice. It is not the complete pilot Curriculum Input
Contract described by `L2-CIC-01` through `L2-CIC-14`.

`release-manifest.json` is the immutable release index. It identifies every
portable artifact, its media type and SHA-256 digest, the conformance summary,
and the deterministic aggregate release checksum. `ICD.md`,
`compatibility.json`, `validation-codes.json`, and `release-notes.md` provide
human- and machine-readable governance without an agent runtime.

The package supports stable metadata and creation evidence, reproducible
repository snapshots, systems and subsystems, typed relationships, terminology,
ordered course/module/lesson content, and formative or summative assessments.
Assessment pools carry selection rules, limits, mappings, grading definitions,
rationales, and explicitly protected answers. Learning objectives have stable
identifiers so assessment mappings are validated rather than merely labeled.

Lessons support three allow-listed content blocks: `prose`, `callout`, and
`codeReference`. Text is rendered as text; arbitrary HTML, scripts, remote
resources, absolute paths, and path traversal are not supported.

`curriculum.schema.json` is the author-facing structural contract. The server adds
semantic validation for stable identifier uniqueness, repository and
architecture references, repository-relative paths, ordered learning metadata,
assessment constraints, protected answers, supported version, and valid line
ranges. Validation issues have stable codes and JSON Pointer paths. Review
responses preserve the assessment contract but replace protected answer values
with `null`.

The `fixtures/` directory contains minimal and representative successful
packages plus an executable conformance catalog with eight invalid categories
and declared issue-code outcomes.
