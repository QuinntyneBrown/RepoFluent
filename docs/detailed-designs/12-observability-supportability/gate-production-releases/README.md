# Gate production releases

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *release operational-readiness gate* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GateProductionReleasesConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GateProductionReleasesController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GateProductionReleasesRequest`.
- **`GateProductionReleasesRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GateProductionReleasesHandler`** — application handler that loads authorized state,
  invokes `GateProductionReleasesPolicy`, and commits one result.
- **`GateProductionReleasesPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGateProductionReleasesRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GateProductionReleasesRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-17` | `L1-OBS-07` | Production release approval shall require current evidence for telemetry coverage, dashboards/alerts, performance budgets, security/privacy gates, backup/restore, incident/on-call ownership, runbooks, capacity/scale profile, dependency health, and rollback/recovery plan. Exceptions shall be approved, scoped, owned, and expiring. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for gate production releases](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for gate production releases](diagrams/c4-container.png)

### Components

`GateProductionReleasesController` dispatches `GateProductionReleasesRequest` to `GateProductionReleasesHandler`. The handler
uses `GateProductionReleasesPolicy` and `IGateProductionReleasesRepository` before it commits a state change.

![C4 component view for gate production releases](diagrams/c4-component.png)

### Class structure

`GateProductionReleasesHandler` depends on the request, policy, and repository abstractions.
`IGateProductionReleasesRepository` stores `GateProductionReleasesRecord` under tenant and version context.

![Class diagram for gate production releases](diagrams/class-structure.png)

### Behaviour — release operational-readiness gate

The sequence applies `L2-OBS-17` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for release operational-readiness gate](diagrams/sequence-l2-obs-17.png)
