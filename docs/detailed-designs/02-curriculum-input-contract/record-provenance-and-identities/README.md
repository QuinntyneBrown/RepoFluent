# Record provenance and identities

## Overview

RepoFluent's Curriculum Input Contract now carries provenance and uncertainty
without flattening either into unqualified facts. Package, objective, lesson
block, and assessment-item evidence resolves to declared source-snapshot
documents, identifies direct evidence versus synthesis or interpretation, and
keeps assumptions, omissions, conflicts, and unresolved questions explicit.

The same vertical slice enforces globally unique lowercase-kebab identifiers,
reports every colliding JSON Pointer, and defines canonical portable primitives
for encoding, media type, locale, UTC date/time, duration, checksums, nulls, and
defaults. Authors inspect the result in the Angular contract workbench before
the governed curriculum workflow advances.

## Description

The implemented slice uses the existing curriculum upload and review boundary:

- **`EvidenceMetadata` and `SourceCitation`** — typed contract records for
  confidence, snapshot-resolved citations, assumptions, omissions, conflicts,
  and unresolved questions.
- **`PackageValidator`** — validates citation repository/document targets,
  evidence enumerations, canonical UTC values and locales, normalized
  identifiers, typed references, and every duplicate-identity path.
- **`curriculum.schema.json`** — exposes the same evidence shapes and canonical
  primitive constraints to offline authoring and validation tools.
- **`ICD.md`** — owns deterministic identifier-generation guidance and the
  normative primitive, null, default, enumeration, and checksum rules.
- **`ContractModelWorkbenchComponent`** — renders citation lineage, uncertainty,
  confidence, identity inventory, and canonical rules using the versioned
  design-system tokens.
- **`CurriculumWorkflow` and `ICurriculumStore`** — preserve accepted evidence in
  the tenant-scoped package JSON already governed by the upload workflow.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-07` | `L1-CIC-02` | Generated claims, explanations, objectives, and assessment rationales shall support source citations where direct sources exist. Package-level and element-level metadata shall represent confidence, assumptions, omissions, conflicting sources, and unresolved questions without presenting them as verified facts. |
| `L2-CIC-08` | `L1-CIC-04` | All reusable entities shall have stable package-local identifiers following the documented character, length, uniqueness, and normalization rules. References shall target declared identifiers of compatible types. Identifier generation guidance shall allow regeneration from equivalent source scope to retain identities where semantic entities are unchanged. |
| `L2-CIC-09` | `L1-CIC-04` | The ICD shall define UTF-8 encoding, JSON media type, canonical date/time and timezone representation, duration format, checksum representation, identifier normalization, supported locales, enumerations, null semantics, and default behavior. Defaults shall be applied only where the ICD explicitly permits them. |

### Implementation evidence

- Playwright starts with `provenance-and-identities.spec.ts` and the
  `ProvenanceAndIdentitiesPage` Page Object, covering the valid workbench,
  invalid citations, all duplicate paths, and non-canonical primitives.
- `ProvenanceAndIdentityTests` exercises the application validator directly,
  including package- and element-level evidence round-tripping.
- The representative contract fixture carries package, objective, content, and
  rationale evidence and validates against JSON Schema 2020-12.
- The visual acceptance baseline captures the provenance workbench at the
  design-system desktop profile.

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for record provenance and identities](diagrams/c4-context.png)

### Containers

Contract workbench sends typed requests to Contract Registry API. The API applies
server-owned rules and records the accepted outcome in Contract artifact store.

![C4 container view for record provenance and identities](diagrams/c4-container.png)

### Components

`RecordProvenanceAndIdentitiesController` dispatches `RecordProvenanceAndIdentitiesRequest` to `RecordProvenanceAndIdentitiesHandler`. The handler
uses `RecordProvenanceAndIdentitiesPolicy` and `IRecordProvenanceAndIdentitiesRepository` before it commits a state change.

![C4 component view for record provenance and identities](diagrams/c4-component.png)

### Class structure

`RecordProvenanceAndIdentitiesHandler` depends on the request, policy, and repository abstractions.
`IRecordProvenanceAndIdentitiesRepository` stores `RecordProvenanceAndIdentitiesRecord` under tenant and version context.

![Class diagram for record provenance and identities](diagrams/class-structure.png)

### Behaviour — provenance and uncertainty

The sequence applies `L2-CIC-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for provenance and uncertainty](diagrams/sequence-l2-cic-07.png)

### Behaviour — stable identifiers and references

The sequence applies `L2-CIC-08` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for stable identifiers and references](diagrams/sequence-l2-cic-08.png)

### Behaviour — canonical primitive formats

The sequence applies `L2-CIC-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for canonical primitive formats](diagrams/sequence-l2-cic-09.png)
