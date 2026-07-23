# Compare and retire versions

## Overview

RepoFluent's Curriculum Lifecycle subsystem moves curriculum packages through intake, validation, draft, review, publication, comparison, and retirement. This feature
brings *retirement and unpublication*, *semantic version comparison* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum operator starts the outcome through Curriculum administration.
Curriculum Lifecycle API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`CompareAndRetireVersionsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CurriculumLifecycleApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`CompareAndRetireVersionsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `CompareAndRetireVersionsRequest`.
- **`CompareAndRetireVersionsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`CompareAndRetireVersionsHandler`** — application handler that loads authorized state,
  invokes `CompareAndRetireVersionsPolicy`, and commits one result.
- **`CompareAndRetireVersionsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ICompareAndRetireVersionsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`CompareAndRetireVersionsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-10` | `L1-CLI-07` | Retirement shall prevent new discovery or assignment and shall follow configured behavior for existing assignments while preserving content required to interpret historical records. It shall not hard-delete evidence. Reversal, if supported by policy, shall be an explicit audited transition. |
| `L2-CLI-11` | `L1-CLI-08` | The subsystem should compare stable entities across versions and classify added, removed, modified, reordered, source-changed, assessment-changed, and unresolved-reference changes. It should identify affected objectives and distinguish presentational edits from changes that may require learner refresh. |

## Diagrams

### System context

The curriculum operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Content scanning service only through the boundary
described by the requirements and approved configuration.

![C4 system context for compare and retire versions](diagrams/c4-context.png)

### Containers

Curriculum administration sends typed requests to Curriculum Lifecycle API. The API applies
server-owned rules and records the accepted outcome in Curriculum store.

![C4 container view for compare and retire versions](diagrams/c4-container.png)

### Components

`CompareAndRetireVersionsController` dispatches `CompareAndRetireVersionsRequest` to `CompareAndRetireVersionsHandler`. The handler
uses `CompareAndRetireVersionsPolicy` and `ICompareAndRetireVersionsRepository` before it commits a state change.

![C4 component view for compare and retire versions](diagrams/c4-component.png)

### Class structure

`CompareAndRetireVersionsHandler` depends on the request, policy, and repository abstractions.
`ICompareAndRetireVersionsRepository` stores `CompareAndRetireVersionsRecord` under tenant and version context.

![Class diagram for compare and retire versions](diagrams/class-structure.png)

### Behaviour — retirement and unpublication

The sequence applies `L2-CLI-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for retirement and unpublication](diagrams/sequence-l2-cli-10.png)

### Behaviour — semantic version comparison

The sequence applies `L2-CLI-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for semantic version comparison](diagrams/sequence-l2-cli-11.png)
