# Save and submit responses

## Overview

RepoFluent's Assessment and Mastery subsystem runs governed assessments, protects answer data, retains attempt evidence, and calculates mastery. This feature
brings *response save and submission*, *immutable attempt record* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Assessment application.
Assessment API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`SaveAndSubmitResponsesPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AssessmentApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`SaveAndSubmitResponsesController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `SaveAndSubmitResponsesRequest`.
- **`SaveAndSubmitResponsesRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`SaveAndSubmitResponsesHandler`** — application handler that loads authorized state,
  invokes `SaveAndSubmitResponsesPolicy`, and commits one result.
- **`SaveAndSubmitResponsesPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ISaveAndSubmitResponsesRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`SaveAndSubmitResponsesRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ASM-09` | `L1-ASM-05` | Response saves and final submission shall use attempt/item versions, idempotent event identifiers, optimistic concurrency, and durable acknowledgement. Final submission shall atomically close the attempt and enqueue or perform grading once. A closed attempt shall reject response mutation. |
| `L2-ASM-11` | `L1-ASM-05` | Attempt evidence shall include tenant, learner, assignment, curriculum/version, assessment/item versions, selected order, response records, start/deadline/submission/grade timestamps, score/outcome, attempt number, feedback state, and correlation/audit references. Corrections shall append superseding evidence, not edit the original. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Time service only through the boundary
described by the requirements and approved configuration.

![C4 system context for save and submit responses](diagrams/c4-context.png)

### Containers

Assessment application sends typed requests to Assessment API. The API applies
server-owned rules and records the accepted outcome in Assessment evidence store.

![C4 container view for save and submit responses](diagrams/c4-container.png)

### Components

`SaveAndSubmitResponsesController` dispatches `SaveAndSubmitResponsesRequest` to `SaveAndSubmitResponsesHandler`. The handler
uses `SaveAndSubmitResponsesPolicy` and `ISaveAndSubmitResponsesRepository` before it commits a state change.

![C4 component view for save and submit responses](diagrams/c4-component.png)

### Class structure

`SaveAndSubmitResponsesHandler` depends on the request, policy, and repository abstractions.
`ISaveAndSubmitResponsesRepository` stores `SaveAndSubmitResponsesRecord` under tenant and version context.

![Class diagram for save and submit responses](diagrams/class-structure.png)

### Behaviour — response save and submission

The sequence applies `L2-ASM-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for response save and submission](diagrams/sequence-l2-asm-09.png)

### Behaviour — immutable attempt record

The sequence applies `L2-ASM-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for immutable attempt record](diagrams/sequence-l2-asm-11.png)
