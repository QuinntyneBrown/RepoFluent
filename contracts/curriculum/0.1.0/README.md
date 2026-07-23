# Curriculum contract 0.1.0

This prerelease contract is the bounded input for RepoFluent's first
curriculum-to-learning vertical slice. It is not the complete pilot Curriculum Input
Contract described by `L2-CIC-01` through `L2-CIC-14`.

The package supports metadata, a reproducible repository snapshot, ordered
course/module/lesson content, objectives, and three allow-listed content blocks:
`prose`, `callout`, and `codeReference`. Text is rendered as text; arbitrary HTML,
scripts, remote resources, absolute paths, and path traversal are not supported.

`curriculum.schema.json` is the author-facing structural contract. The server adds
semantic validation for stable identifier uniqueness, repository references,
repository-relative paths, supported version, and valid line ranges. Validation
issues have stable codes and JSON Pointer paths.

The `fixtures/` directory contains the acceptance-tested representative package.
