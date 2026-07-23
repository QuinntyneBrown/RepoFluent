# Show source snapshot drift

## Overview

RepoFluent's Codebase Navigation subsystem connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships. This feature
brings *source snapshot presentation*, *drift warning*, *current provider connection* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Code navigator.
Code Navigation API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ShowSourceSnapshotDriftPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CodeNavigationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ShowSourceSnapshotDriftController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ShowSourceSnapshotDriftRequest`.
- **`ShowSourceSnapshotDriftRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ShowSourceSnapshotDriftHandler`** — application handler that loads authorized state,
  invokes `ShowSourceSnapshotDriftPolicy`, and commits one result.
- **`ShowSourceSnapshotDriftPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IShowSourceSnapshotDriftRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ShowSourceSnapshotDriftRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CBN-05` | `L1-CBN-04` | Every excerpt/reference shall present available repository identity, branch/commit or document revision, and snapshot time. The UI shall distinguish immutable binding, branch-only binding, and unknown/current state and shall not label an unverified reference as current. |
| `L2-CBN-06` | `L1-CBN-04` | When current authorized provider metadata is available, the subsystem shall compare the published snapshot/revision to current state using documented semantics. A mismatch or inability to confirm shall produce a nonblocking warning without rewriting the published reference. |
| `L2-CBN-11` | `L1-CBN-08` | A future provider connection may retrieve current metadata or read-only source only after tenant configuration, user/service authorization, repository allow-listing, classification checks, and audit. Provider failure shall not make the published supplied excerpt unavailable. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Repository provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for show source snapshot drift](diagrams/c4-context.png)

### Containers

Code navigator sends typed requests to Code Navigation API. The API applies
server-owned rules and records the accepted outcome in Code metadata store.

![C4 container view for show source snapshot drift](diagrams/c4-container.png)

### Components

`ShowSourceSnapshotDriftController` dispatches `ShowSourceSnapshotDriftRequest` to `ShowSourceSnapshotDriftHandler`. The handler
uses `ShowSourceSnapshotDriftPolicy` and `IShowSourceSnapshotDriftRepository` before it commits a state change.

![C4 component view for show source snapshot drift](diagrams/c4-component.png)

### Class structure

`ShowSourceSnapshotDriftHandler` depends on the request, policy, and repository abstractions.
`IShowSourceSnapshotDriftRepository` stores `ShowSourceSnapshotDriftRecord` under tenant and version context.

![Class diagram for show source snapshot drift](diagrams/class-structure.png)

### Behaviour — source snapshot presentation

The sequence applies `L2-CBN-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for source snapshot presentation](diagrams/sequence-l2-cbn-05.png)

### Behaviour — drift warning

The sequence applies `L2-CBN-06` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for drift warning](diagrams/sequence-l2-cbn-06.png)

### Behaviour — current provider connection

The sequence applies `L2-CBN-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for current provider connection](diagrams/sequence-l2-cbn-11.png)
