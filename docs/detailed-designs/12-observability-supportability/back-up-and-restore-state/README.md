# Back up and restore state

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *backup policy and coverage*, *restore verification* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`BackUpAndRestoreStateConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`BackUpAndRestoreStateController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `BackUpAndRestoreStateRequest`.
- **`BackUpAndRestoreStateRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`BackUpAndRestoreStateHandler`** — application handler that loads authorized state,
  invokes `BackUpAndRestoreStatePolicy`, and commits one result.
- **`BackUpAndRestoreStatePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IBackUpAndRestoreStateRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`BackUpAndRestoreStateRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-13` | `L1-OBS-07` | Backup policy shall identify in-scope stores, encryption, schedule, retention, isolation, integrity checking, RPO/RTO targets, tenant/config/content/evidence dependencies, and handling of deleted/held data. Backup success alone shall not substitute for restore verification. |
| `L2-OBS-14` | `L1-OBS-07` | Restore exercises shall occur on a documented cadence in an isolated environment and verify integrity, tenant boundaries, identity/configuration consistency, immutable curriculum/attempt/audit links, derived-store rebuild, and achieved recovery objectives. Results and remediation shall be retained. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for back up and restore state](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for back up and restore state](diagrams/c4-container.png)

### Components

`BackUpAndRestoreStateController` dispatches `BackUpAndRestoreStateRequest` to `BackUpAndRestoreStateHandler`. The handler
uses `BackUpAndRestoreStatePolicy` and `IBackUpAndRestoreStateRepository` before it commits a state change.

![C4 component view for back up and restore state](diagrams/c4-component.png)

### Class structure

`BackUpAndRestoreStateHandler` depends on the request, policy, and repository abstractions.
`IBackUpAndRestoreStateRepository` stores `BackUpAndRestoreStateRecord` under tenant and version context.

![Class diagram for back up and restore state](diagrams/class-structure.png)

### Behaviour — backup policy and coverage

The sequence applies `L2-OBS-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for backup policy and coverage](diagrams/sequence-l2-obs-13.png)

### Behaviour — restore verification

The sequence applies `L2-OBS-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for restore verification](diagrams/sequence-l2-obs-14.png)
