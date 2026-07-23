# Operate and audit the lifecycle

## Overview

RepoFluent's Curriculum Lifecycle subsystem moves curriculum packages through intake, validation, draft, review, publication, comparison, and retirement. This feature
brings *lifecycle status and recovery*, *lifecycle audit trail* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum operator starts the outcome through Curriculum administration.
Curriculum Lifecycle API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`OperateAndAuditLifecyclePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CurriculumLifecycleApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`OperateAndAuditLifecycleController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `OperateAndAuditLifecycleRequest`.
- **`OperateAndAuditLifecycleRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`OperateAndAuditLifecycleHandler`** — application handler that loads authorized state,
  invokes `OperateAndAuditLifecyclePolicy`, and commits one result.
- **`OperateAndAuditLifecyclePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IOperateAndAuditLifecycleRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`OperateAndAuditLifecycleRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-13` | `L1-CLI-11` | Authors and administrators shall see current state, completed/active stage, timestamps, actionable safe failure details, and support correlation identifier. Stale processing jobs shall be detected. Authorized retry shall resume from a safe stage without bypassing validation or approval. |
| `L2-CLI-14` | `L1-CLI-11` | Upload, scan, validation, acknowledgement, draft import, review, approval/rejection, publication, retry, retirement, and version-comparison access shall produce tenant-scoped audit or operational evidence appropriate to sensitivity. |

## Diagrams

### System context

The curriculum operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Content scanning service only through the boundary
described by the requirements and approved configuration.

![C4 system context for operate and audit the lifecycle](diagrams/c4-context.png)

### Containers

Curriculum administration sends typed requests to Curriculum Lifecycle API. The API applies
server-owned rules and records the accepted outcome in Curriculum store.

![C4 container view for operate and audit the lifecycle](diagrams/c4-container.png)

### Components

`OperateAndAuditLifecycleController` dispatches `OperateAndAuditLifecycleRequest` to `OperateAndAuditLifecycleHandler`. The handler
uses `OperateAndAuditLifecyclePolicy` and `IOperateAndAuditLifecycleRepository` before it commits a state change.

![C4 component view for operate and audit the lifecycle](diagrams/c4-component.png)

### Class structure

`OperateAndAuditLifecycleHandler` depends on the request, policy, and repository abstractions.
`IOperateAndAuditLifecycleRepository` stores `OperateAndAuditLifecycleRecord` under tenant and version context.

![Class diagram for operate and audit the lifecycle](diagrams/class-structure.png)

### Behaviour — lifecycle status and recovery

The sequence applies `L2-CLI-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for lifecycle status and recovery](diagrams/sequence-l2-cli-13.png)

### Behaviour — lifecycle audit trail

The sequence applies `L2-CLI-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for lifecycle audit trail](diagrams/sequence-l2-cli-14.png)
