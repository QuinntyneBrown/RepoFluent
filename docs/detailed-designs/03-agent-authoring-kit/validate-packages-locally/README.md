# Validate packages locally

## Overview

The acquired RepoFluent authoring kit validates curriculum packages entirely
inside the approved workstation. One dependency-free Node.js command reads the
named package and its bundled contract validator.

The command accepts an explicit contract or auto-detection, JSON or text output,
and an information, warning, or error threshold. Deterministic exit statuses
separate success, warnings, package failure, invocation failure, and internal
validator failure.

Each machine-readable issue contains a stable code, severity, blocking
classification, JSON Pointer, and safe explanation. Issue messages omit package
values, protected answers, source excerpts, credentials, and personal data.

## Description

The implemented vertical slice contains the following building blocks.

- **Local validation guide** — documents noninteractive options, JSON fields,
  severity filtering, five exit statuses, legacy compatibility, and the offline
  boundary.
- **Success, warning, and failure fixtures** — exercise clean validation,
  ignored noncritical extensions, and a missing required title.
- **`validate.mjs`** — parses options, auto-detects contract `0.1.0`, loads the
  bundled validator, maps schema findings, evaluates extension support, filters
  issues, and formats one result.
- **`curriculum.validator.mjs`** — contains a bundled standalone JSON Schema
  validator with no package or network dependency.
- **`build_authoring_kit.mjs` and `verify_authoring_kits.mjs`** — reproduce the
  fixtures, hash every artifact, reject network imports, and exercise status
  `0`, `1`, `2`, and `3`.
- **`AuthoringValidatorPolicyComponent`** — presents the option matrix, issue
  envelope, offline boundary, and status meanings with design-system tokens.
- **`AuthoringValidatorPage`** — provides the Playwright Page Object for local
  process outcomes, internal status `4`, accessible content, and visual
  evidence.

The one-argument command retains the original `0.1.0` JSON shape and error-only
threshold. Flagged invocation returns the expanded outcome envelope.

## Requirements

The feature realizes the following level-2 requirement. The row cites the L1
parent named by the source requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-08` | `L1-AAK-06` | The kit shall document a noninteractive local command that accepts package path, contract version or auto-detection, output format, and severity threshold. Exit status shall distinguish success, warnings-only, validation failure, invalid invocation, and internal validator failure. JSON output shall implement the validation issue contract. |

### Implementation evidence

- `validate-packages-locally.spec.ts` begins the slice with Page Object
  acceptance for the visible command and three package outcomes.
- The warning fixture emits `CIC_EXTENSION_IGNORED` at
  `/extensions/0/namespace` and exits with status `3`.
- The missing-title fixture emits `CIC_REQUIRED` at `/title` and exits with
  status `1`.
- Unsupported contract selection emits `AAK_VALIDATOR_INVOCATION` and exits
  with status `2`.
- A missing or unusable bundled validator emits `AAK_VALIDATOR_INTERNAL`
  without exception details and exits with status `4`.
- Windows and Linux Chromium baselines capture the complete 520-pixel policy
  panel.

## Diagrams

### System context

The curriculum-authoring agent invokes the acquired kit against a package in
the approved workspace. Package data remains local.

![C4 system context for local package validation](diagrams/c4-context.png)

### Containers

The Angular view communicates the interface contract. The Node.js command reads
the package and compiled validator from the acquired release.

![C4 container view for local package validation](diagrams/c4-container.png)

### Components

The command coordinates option parsing, contract selection, schema validation,
extension evaluation, threshold filtering, output formatting, and exit status.

![C4 component view for local package validation](diagrams/c4-component.png)

### Class structure

Validator options select one contract, output format, and threshold. A report
contains ordered validation issues and one deterministic outcome.

![Class diagram for local package validation](diagrams/class-structure.png)

### Behaviour — local validator interface

For `L2-AAK-08`, the command reads package bytes, selects the bundled contract,
validates locally, filters issues, and returns one safe report and status.

![Sequence diagram for local validator interface](diagrams/sequence-l2-aak-08.png)
