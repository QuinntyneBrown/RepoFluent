# Model a curriculum package

## Overview

RepoFluent's Curriculum Input Contract subsystem defines the portable curriculum package, its compatibility rules, and its conformance artifacts. This feature
brings *package metadata and source snapshot*, *architecture and learning model*, *assessment representation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The contract maintainer starts the outcome through Contract workbench.
Contract Registry API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ModelCurriculumPackageWorkbench`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`ContractRegistryClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ModelCurriculumPackageController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ModelCurriculumPackageRequest`.
- **`ModelCurriculumPackageRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ModelCurriculumPackageHandler`** — application handler that loads authorized state,
  invokes `ModelCurriculumPackagePolicy`, and commits one result.
- **`ModelCurriculumPackagePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IModelCurriculumPackageRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ModelCurriculumPackageRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-02` | `L1-CIC-02` | The schema shall represent package stable identifier, contract version, title, description, ownership, locale, creation metadata, and source snapshot. A source snapshot shall support repositories, repository-relative identity, branches or commits, document identifiers, and source timestamps where available. |
| `L2-CIC-03` | `L1-CIC-02` | The schema shall model systems, subsystems, responsibilities, boundaries, dependencies, terminology, and typed relationships, together with courses, modules, lessons, learning objectives, prerequisites, estimated duration, difficulty, audience, tags, required/optional status, ordering, and completion rules. |
| `L2-CIC-06` | `L1-CIC-02` | The schema shall represent formative and summative assessments, supported item types, answer and grading definitions, question pools, selection behavior, thresholds, attempts, time limits, feedback release, rationales, and mappings to learning objectives/systems/subsystems. Protected answer data shall be distinguishable from learner-visible data. |

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for model a curriculum package](diagrams/c4-context.png)

### Containers

Contract workbench sends typed requests to Contract Registry API. The API applies
server-owned rules and records the accepted outcome in Contract artifact store.

![C4 container view for model a curriculum package](diagrams/c4-container.png)

### Components

`ModelCurriculumPackageController` dispatches `ModelCurriculumPackageRequest` to `ModelCurriculumPackageHandler`. The handler
uses `ModelCurriculumPackagePolicy` and `IModelCurriculumPackageRepository` before it commits a state change.

![C4 component view for model a curriculum package](diagrams/c4-component.png)

### Class structure

`ModelCurriculumPackageHandler` depends on the request, policy, and repository abstractions.
`IModelCurriculumPackageRepository` stores `ModelCurriculumPackageRecord` under tenant and version context.

![Class diagram for model a curriculum package](diagrams/class-structure.png)

### Behaviour — package metadata and source snapshot

The sequence applies `L2-CIC-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for package metadata and source snapshot](diagrams/sequence-l2-cic-02.png)

### Behaviour — architecture and learning model

The sequence applies `L2-CIC-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for architecture and learning model](diagrams/sequence-l2-cic-03.png)

### Behaviour — assessment representation

The sequence applies `L2-CIC-06` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for assessment representation](diagrams/sequence-l2-cic-06.png)
