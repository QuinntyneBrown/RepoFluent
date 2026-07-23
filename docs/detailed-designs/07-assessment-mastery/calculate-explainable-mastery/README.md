# Calculate explainable mastery

## Overview

RepoFluent's Assessment and Mastery subsystem runs governed assessments, protects answer data, retains attempt evidence, and calculates mastery. This feature
brings *explainable mastery calculation*, *mastery recalculation triggers* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Assessment application.
Assessment API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`CalculateExplainableMasteryPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AssessmentApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`CalculateExplainableMasteryController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `CalculateExplainableMasteryRequest`.
- **`CalculateExplainableMasteryRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`CalculateExplainableMasteryHandler`** — application handler that loads authorized state,
  invokes `CalculateExplainableMasteryPolicy`, and commits one result.
- **`CalculateExplainableMasteryPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ICalculateExplainableMasteryRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`CalculateExplainableMasteryRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ASM-16` | `L1-ASM-10` | Mastery shall be derived per objective using a documented tenant-consistent policy whose inputs may include completion, coverage, latest/best result, attempts, confidence, and recency. The stored record shall identify evidence, weights/rules, calculation version, value/state, and calculation time. Insufficient evidence shall remain distinguishable from low mastery. |
| `L2-ASM-17` | `L1-ASM-10` | Mastery shall recalculate idempotently after qualifying progress/result evidence, item invalidation, policy-version change, and scheduled recency transition. Recalculation shall not rewrite source evidence and shall prevent an older job from superseding a newer calculation basis. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Time service only through the boundary
described by the requirements and approved configuration.

![C4 system context for calculate explainable mastery](diagrams/c4-context.png)

### Containers

Assessment application sends typed requests to Assessment API. The API applies
server-owned rules and records the accepted outcome in Assessment evidence store.

![C4 container view for calculate explainable mastery](diagrams/c4-container.png)

### Components

`CalculateExplainableMasteryController` dispatches `CalculateExplainableMasteryRequest` to `CalculateExplainableMasteryHandler`. The handler
uses `CalculateExplainableMasteryPolicy` and `ICalculateExplainableMasteryRepository` before it commits a state change.

![C4 component view for calculate explainable mastery](diagrams/c4-component.png)

### Class structure

`CalculateExplainableMasteryHandler` depends on the request, policy, and repository abstractions.
`ICalculateExplainableMasteryRepository` stores `CalculateExplainableMasteryRecord` under tenant and version context.

![Class diagram for calculate explainable mastery](diagrams/class-structure.png)

### Behaviour — explainable mastery calculation

The sequence applies `L2-ASM-16` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for explainable mastery calculation](diagrams/sequence-l2-asm-16.png)

### Behaviour — mastery recalculation triggers

The sequence applies `L2-ASM-17` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for mastery recalculation triggers](diagrams/sequence-l2-asm-17.png)
