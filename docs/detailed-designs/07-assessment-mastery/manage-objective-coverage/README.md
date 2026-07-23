# Manage objective coverage

## Overview

RepoFluent's Assessment and Mastery subsystem runs governed assessments, protects answer data, retains attempt evidence, and calculates mastery. This feature
brings *objective mapping and coverage*, *assessment quality checks* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Assessment application.
Assessment API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ManageObjectiveCoveragePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AssessmentApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ManageObjectiveCoverageController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ManageObjectiveCoverageRequest`.
- **`ManageObjectiveCoverageRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ManageObjectiveCoverageHandler`** — application handler that loads authorized state,
  invokes `ManageObjectiveCoveragePolicy`, and commits one result.
- **`ManageObjectiveCoveragePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IManageObjectiveCoverageRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ManageObjectiveCoverageRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ASM-13` | `L1-ASM-04` | Each scored item shall resolve to one or more published objective/system/subsystem identifiers with declared contribution weights where needed. Assessment validation shall report missing mappings, mappings to inaccessible/missing targets, and objectives expected but not covered. |
| `L2-ASM-15` | `L1-ASM-09` | Quality checks should detect exact/near duplicate stems and answers, answer text leaked into visible prompts/explanations, missing rationales, invalid distractor structure, implausible scoring, and objective coverage gaps. Findings shall be deterministic, reviewable, and severity-configurable within product bounds. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Time service only through the boundary
described by the requirements and approved configuration.

![C4 system context for manage objective coverage](diagrams/c4-context.png)

### Containers

Assessment application sends typed requests to Assessment API. The API applies
server-owned rules and records the accepted outcome in Assessment evidence store.

![C4 container view for manage objective coverage](diagrams/c4-container.png)

### Components

`ManageObjectiveCoverageController` dispatches `ManageObjectiveCoverageRequest` to `ManageObjectiveCoverageHandler`. The handler
uses `ManageObjectiveCoveragePolicy` and `IManageObjectiveCoverageRepository` before it commits a state change.

![C4 component view for manage objective coverage](diagrams/c4-component.png)

### Class structure

`ManageObjectiveCoverageHandler` depends on the request, policy, and repository abstractions.
`IManageObjectiveCoverageRepository` stores `ManageObjectiveCoverageRecord` under tenant and version context.

![Class diagram for manage objective coverage](diagrams/class-structure.png)

### Behaviour — objective mapping and coverage

The sequence applies `L2-ASM-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for objective mapping and coverage](diagrams/sequence-l2-asm-13.png)

### Behaviour — assessment quality checks

The sequence applies `L2-ASM-15` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for assessment quality checks](diagrams/sequence-l2-asm-15.png)
