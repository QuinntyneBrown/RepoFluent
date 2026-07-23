# Open external code links

## Overview

RepoFluent's Codebase Navigation subsystem connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships. This feature
brings *external deep-link policy* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Code navigator.
Code Navigation API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`OpenExternalCodeLinksPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CodeNavigationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`OpenExternalCodeLinksController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `OpenExternalCodeLinksRequest`.
- **`OpenExternalCodeLinksRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`OpenExternalCodeLinksHandler`** — application handler that loads authorized state,
  invokes `OpenExternalCodeLinksPolicy`, and commits one result.
- **`OpenExternalCodeLinksPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IOpenExternalCodeLinksRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`OpenExternalCodeLinksRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CBN-03` | `L1-CBN-02` | If a repository provider link is supplied, the subsystem shall construct or allow only approved provider schemes/hosts and authorized repository/path/revision data. The learner shall be warned before leaving RepoFluent as configured. Tokens or credentials shall never appear in URLs. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Repository provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for open external code links](diagrams/c4-context.png)

### Containers

Code navigator sends typed requests to Code Navigation API. The API applies
server-owned rules and records the accepted outcome in Code metadata store.

![C4 container view for open external code links](diagrams/c4-container.png)

### Components

`OpenExternalCodeLinksController` dispatches `OpenExternalCodeLinksRequest` to `OpenExternalCodeLinksHandler`. The handler
uses `OpenExternalCodeLinksPolicy` and `IOpenExternalCodeLinksRepository` before it commits a state change.

![C4 component view for open external code links](diagrams/c4-component.png)

### Class structure

`OpenExternalCodeLinksHandler` depends on the request, policy, and repository abstractions.
`IOpenExternalCodeLinksRepository` stores `OpenExternalCodeLinksRecord` under tenant and version context.

![Class diagram for open external code links](diagrams/class-structure.png)

### Behaviour — external deep-link policy

The sequence applies `L2-CBN-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for external deep-link policy](diagrams/sequence-l2-cbn-03.png)
