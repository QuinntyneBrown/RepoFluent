# Publish a versioned contract

## Overview

RepoFluent's Curriculum Input Contract subsystem defines the portable curriculum package, its compatibility rules, and its conformance artifacts. This feature
brings *versioned contract release unit*, *version compatibility and migration*, *conformance fixture suite* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The contract maintainer publishes the checked-in release unit through the
Curriculum imports workbench. A public ASP.NET Core release endpoint verifies
the manifest and every artifact checksum before it returns release metadata or
portable artifact bytes. Git and CI preserve the release evidence in the
repository without depending on a model or agent vendor.

## Description

The vertical slice uses the following checked-in implementation boundaries.

- **`release-manifest.json`** — immutable release declaration with exact version,
  publication time, artifact media types, SHA-256 digests, fixture summary, and
  a deterministic checksum over the complete artifact set.
- **`ICD.md` and `compatibility.json`** — semantic-version meaning, supported
  window, forward and backward compatibility, 180-day deprecation notice,
  unsupported-version behavior, migration ownership, preservation rules, and
  explicit loss reporting.
- **`validation-codes.json`** — versioned catalog synchronized with the package
  validator and public release boundary.
- **`fixtures/minimal-valid.json` and `order-processing.json`** — minimal valid
  and representative C#/Angular successful packages.
- **`fixtures/conformance-catalog.json`** — executable mutation fixtures for
  required fields, types, identifiers, references, ordering, security,
  assessment rules, and limits. Every case declares success or expected issue
  codes.
- **`verify_contract_releases.mjs`** — CI release gate that verifies inventory,
  artifact version identity, SHA-256 values, release checksum, code-catalog
  currency, and fixture coverage.
- **`ContractReleaseCatalog` and `ContractEndpoints`** — public API boundary that
  re-verifies the release at read time, restricts retrieval to manifest-declared
  paths, and returns stable unsupported-version guidance.
- **`ContractReleasePanelComponent`** — design-system workbench surface for
  checksum evidence, artifact retrieval, compatibility, migration, and fixture
  coverage.
- **`ContractReleasePage` and `contract-release.spec.ts`** — Page Object Model
  acceptance coverage for public retrieval, unsupported versions, semantics,
  conformance, and Windows/Linux visuals.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-01` | `L1-CIC-01` | Each contract release shall be an immutable, checksummed unit containing the JSON Schema, ICD, compatibility declaration, validation-code catalog, fixtures, and release notes. Each artifact shall identify the exact contract version and shall be retrievable without depending on a particular model or agent product. |
| `L2-CIC-12` | `L1-CIC-05` | The ICD shall define semantic-version meaning, supported-version window, forward/backward compatibility, deprecation notice period, migration responsibility, and behavior for unsupported major/minor versions. A migration shall preserve stable identifiers and protected semantics or report any unavoidable loss. |
| `L2-CIC-14` | `L1-CIC-08` | Every contract release shall include a minimal valid fixture, a representative C#/Angular curriculum, and invalid fixtures covering required fields, types, identifiers, references, ordering, security, assessment rules, and limits. Fixtures shall declare their expected issue codes or successful outcome. |

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for publish a versioned contract](diagrams/c4-context.png)

### Containers

The Curriculum imports workbench reads verified release metadata from the
public contract release API. Artifact links return only paths declared by the
checksummed manifest.

![C4 container view for publish a versioned contract](diagrams/c4-container.png)

### Components

`ContractEndpoints` dispatches version and artifact reads to
`ContractReleaseCatalog`. The catalog verifies every artifact digest and the
release checksum before it returns typed metadata or bytes.

![C4 component view for publish a versioned contract](diagrams/c4-component.png)

### Class structure

`ContractReleaseCatalog` produces `ContractReleaseView` and
`ContractArtifactView` records from the checked-in manifest and compatibility
declaration. Contract records remain one named type per source file.

![Class diagram for publish a versioned contract](diagrams/class-structure.png)

### Behaviour — versioned contract release unit

The sequence applies `L2-CIC-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for versioned contract release unit](diagrams/sequence-l2-cic-01.png)

### Behaviour — version compatibility and migration

The sequence applies `L2-CIC-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for version compatibility and migration](diagrams/sequence-l2-cic-12.png)

### Behaviour — conformance fixture suite

The sequence applies `L2-CIC-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for conformance fixture suite](diagrams/sequence-l2-cic-14.png)

### Implementation evidence

Status: **Implemented**

- Release `0.1.0` declares eight independently retrievable artifacts and a
  deterministic SHA-256 release checksum.
- The public API re-verifies each artifact and the aggregate release checksum on
  every metadata or artifact read. Undeclared paths and unsupported versions
  return stable, non-disclosing codes.
- The ICD and machine-readable compatibility declaration define major, minor,
  and patch meaning, the supported `>=0.1.0 <0.2.0` window, and backward and
  forward rules. They also define 180-day notice, migration ownership,
  identifier and protected-semantic preservation, and loss reporting.
- The conformance catalog contains two successful fixtures and eight expected
  failures covering every cited category. Backend tests execute all ten cases
  through `PackageValidator`.
- CI compares the validation-code catalog with its source boundaries, verifies
  artifact version identity and digests, and rejects an incomplete or changed
  release.
- The Page Object Model acceptance verifies the workbench evidence, retrieves
  schema bytes without authentication, confirms deterministic unsupported
  version behavior, and records Windows and Linux release-panel baselines.
