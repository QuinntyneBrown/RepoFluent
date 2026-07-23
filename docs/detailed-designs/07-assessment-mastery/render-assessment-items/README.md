# Render assessment items

## Overview

RepoFluent's Assessment and Mastery subsystem runs governed assessments, protects answer data, retains attempt evidence, and calculates mastery. This feature
brings *supported item behavior*, *unsupported or nondeterministic items*, *formative feedback*, *summative feedback control* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Assessment application.
Assessment API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RenderAssessmentItemsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AssessmentApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RenderAssessmentItemsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RenderAssessmentItemsRequest`.
- **`RenderAssessmentItemsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RenderAssessmentItemsHandler`** — application handler that loads authorized state,
  invokes `RenderAssessmentItemsPolicy`, and commits one result.
- **`RenderAssessmentItemsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRenderAssessmentItemsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RenderAssessmentItemsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ASM-01` | `L1-ASM-01` | The delivery and grading model shall support the six PRD item types. It shall define selection cardinality, order significance, matching cardinality, normalization, case/whitespace behavior for short answer, partial-credit policy, unanswered handling, and deterministic score calculation as versioned item data. |
| `L2-ASM-02` | `L1-ASM-01` | Items lacking a supported deterministic grading definition shall not be included as scored launch assessments. An unsupported item shall block publication or be explicitly represented as unscored enrichment where allowed by the contract. |
| `L2-ASM-03` | `L1-ASM-02` | Formative quizzes shall support configured immediate or end-of-quiz feedback, correctness visibility, rationale release, retry behavior, and remediation links. The response payload shall include only data authorized at the current release state. |
| `L2-ASM-04` | `L1-ASM-02` | Summative tests shall support feedback release after submission, after attempt-window closure, after manual release, or never, as configured. Score, item correctness, answer, and rationale may have independent release rules. All delivery endpoints shall enforce the same server-side state. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Time service only through the boundary
described by the requirements and approved configuration.

![C4 system context for render assessment items](diagrams/c4-context.png)

### Containers

Assessment application sends typed requests to Assessment API. The API applies
server-owned rules and records the accepted outcome in Assessment evidence store.

![C4 container view for render assessment items](diagrams/c4-container.png)

### Components

`RenderAssessmentItemsController` dispatches `RenderAssessmentItemsRequest` to `RenderAssessmentItemsHandler`. The handler
uses `RenderAssessmentItemsPolicy` and `IRenderAssessmentItemsRepository` before it commits a state change.

![C4 component view for render assessment items](diagrams/c4-component.png)

### Class structure

`RenderAssessmentItemsHandler` depends on the request, policy, and repository abstractions.
`IRenderAssessmentItemsRepository` stores `RenderAssessmentItemsRecord` under tenant and version context.

![Class diagram for render assessment items](diagrams/class-structure.png)

### Behaviour — supported item behavior

The sequence applies `L2-ASM-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for supported item behavior](diagrams/sequence-l2-asm-01.png)

### Behaviour — unsupported or nondeterministic items

The sequence applies `L2-ASM-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for unsupported or nondeterministic items](diagrams/sequence-l2-asm-02.png)

### Behaviour — formative feedback

The sequence applies `L2-ASM-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for formative feedback](diagrams/sequence-l2-asm-03.png)

### Behaviour — summative feedback control

The sequence applies `L2-ASM-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for summative feedback control](diagrams/sequence-l2-asm-04.png)
