# Render course lessons

## Overview

RepoFluent's Learning Experience subsystem presents assigned curriculum, records durable progress, and preserves learning context. This feature
brings *curriculum hierarchy and metadata*, *safe lesson block rendering*, *core fallback and accessibility* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Learner application.
Learning API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RenderCourseLessonsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`LearningApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RenderCourseLessonsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RenderCourseLessonsRequest`.
- **`RenderCourseLessonsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RenderCourseLessonsHandler`** — application handler that loads authorized state,
  invokes `RenderCourseLessonsPolicy`, and commits one result.
- **`RenderCourseLessonsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRenderCourseLessonsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RenderCourseLessonsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-LEX-03` | `L1-LEX-02` | The learner renderer shall preserve published course, module, and lesson ordering and display outcomes/objectives, prerequisites, difficulty, estimated duration, audience, and completion rules where supplied. Unsatisfied prerequisites shall be visible with the configured block or advisory behavior. |
| `L2-LEX-04` | `L1-LEX-02` | The lesson renderer shall support only allow-listed contract blocks, sanitize display content, provide text alternatives/accessible companions, and fail an individual unsupported block safely without hiding the remainder of an otherwise renderable lesson. The visible error shall carry a support identifier and version context. |
| `L2-LEX-16` | `L1-LEX-12` | Home, course/lesson, progress, search, glossary, navigation, and remediation shall function without WebGPU and with reduced motion. Interactive visuals shall provide keyboard operation and an accessible companion representation. Responsive layouts shall support defined desktop, tablet, and narrow profiles. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Search service only through the boundary
described by the requirements and approved configuration.

![C4 system context for render course lessons](diagrams/c4-context.png)

### Containers

Learner application sends typed requests to Learning API. The API applies
server-owned rules and records the accepted outcome in Learning record store.

![C4 container view for render course lessons](diagrams/c4-container.png)

### Components

`RenderCourseLessonsController` dispatches `RenderCourseLessonsRequest` to `RenderCourseLessonsHandler`. The handler
uses `RenderCourseLessonsPolicy` and `IRenderCourseLessonsRepository` before it commits a state change.

![C4 component view for render course lessons](diagrams/c4-component.png)

### Class structure

`RenderCourseLessonsHandler` depends on the request, policy, and repository abstractions.
`IRenderCourseLessonsRepository` stores `RenderCourseLessonsRecord` under tenant and version context.

![Class diagram for render course lessons](diagrams/class-structure.png)

### Behaviour — curriculum hierarchy and metadata

The sequence applies `L2-LEX-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for curriculum hierarchy and metadata](diagrams/sequence-l2-lex-03.png)

### Behaviour — safe lesson block rendering

The sequence applies `L2-LEX-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for safe lesson block rendering](diagrams/sequence-l2-lex-04.png)

### Behaviour — core fallback and accessibility

The sequence applies `L2-LEX-16` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for core fallback and accessibility](diagrams/sequence-l2-lex-16.png)
