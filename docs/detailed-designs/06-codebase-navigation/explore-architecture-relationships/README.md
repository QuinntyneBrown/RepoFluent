# Explore architecture relationships

## Overview

RepoFluent's Codebase Navigation subsystem connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships. This feature
brings *architecture relationship views* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Code navigator.
Code Navigation API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ExploreArchitectureRelationshipsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CodeNavigationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ExploreArchitectureRelationshipsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ExploreArchitectureRelationshipsRequest`.
- **`ExploreArchitectureRelationshipsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ExploreArchitectureRelationshipsHandler`** — application handler that loads authorized state,
  invokes `ExploreArchitectureRelationshipsPolicy`, and commits one result.
- **`ExploreArchitectureRelationshipsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IExploreArchitectureRelationshipsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ExploreArchitectureRelationshipsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CBN-10` | `L1-CBN-07` | The subsystem should visualize supplied calls, dependencies, routes, components, and data flows with typed/directed relationships, selected-node details, provenance, and links to related learning/code. Every visualization shall provide an accessible list or table with equivalent information and controls. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Repository provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for explore architecture relationships](diagrams/c4-context.png)

### Containers

Code navigator sends typed requests to Code Navigation API. The API applies
server-owned rules and records the accepted outcome in Code metadata store.

![C4 container view for explore architecture relationships](diagrams/c4-container.png)

### Components

`ExploreArchitectureRelationshipsController` dispatches `ExploreArchitectureRelationshipsRequest` to `ExploreArchitectureRelationshipsHandler`. The handler
uses `ExploreArchitectureRelationshipsPolicy` and `IExploreArchitectureRelationshipsRepository` before it commits a state change.

![C4 component view for explore architecture relationships](diagrams/c4-component.png)

### Class structure

`ExploreArchitectureRelationshipsHandler` depends on the request, policy, and repository abstractions.
`IExploreArchitectureRelationshipsRepository` stores `ExploreArchitectureRelationshipsRecord` under tenant and version context.

![Class diagram for explore architecture relationships](diagrams/class-structure.png)

### Behaviour — architecture relationship views

The sequence applies `L2-CBN-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for architecture relationship views](diagrams/sequence-l2-cbn-10.png)
