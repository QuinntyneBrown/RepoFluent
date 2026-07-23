# Follow code tours

## Overview

RepoFluent's Codebase Navigation subsystem connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships. This feature
brings *code tour model and resume* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Code navigator.
Code Navigation API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`FollowCodeToursPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CodeNavigationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`FollowCodeToursController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `FollowCodeToursRequest`.
- **`FollowCodeToursRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`FollowCodeToursHandler`** — application handler that loads authorized state,
  invokes `FollowCodeToursPolicy`, and commits one result.
- **`FollowCodeToursPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IFollowCodeToursRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`FollowCodeToursRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CBN-04` | `L1-CBN-03` | A code tour shall maintain tour identity/version, ordered step, originating course/lesson, reference selection, learner guidance, and completed-step state. Moving among steps and returning from related views shall preserve this context across sessions where progress policy permits. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Repository provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for follow code tours](diagrams/c4-context.png)

### Containers

Code navigator sends typed requests to Code Navigation API. The API applies
server-owned rules and records the accepted outcome in Code metadata store.

![C4 container view for follow code tours](diagrams/c4-container.png)

### Components

`FollowCodeToursController` dispatches `FollowCodeToursRequest` to `FollowCodeToursHandler`. The handler
uses `FollowCodeToursPolicy` and `IFollowCodeToursRepository` before it commits a state change.

![C4 component view for follow code tours](diagrams/c4-component.png)

### Class structure

`FollowCodeToursHandler` depends on the request, policy, and repository abstractions.
`IFollowCodeToursRepository` stores `FollowCodeToursRecord` under tenant and version context.

![Class diagram for follow code tours](diagrams/class-structure.png)

### Behaviour — code tour model and resume

The sequence applies `L2-CBN-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for code tour model and resume](diagrams/sequence-l2-cbn-04.png)
