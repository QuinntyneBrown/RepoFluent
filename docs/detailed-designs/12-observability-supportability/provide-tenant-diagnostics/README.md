# Provide tenant diagnostics

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *tenant-safe diagnostic bundle* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ProvideTenantDiagnosticsConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ProvideTenantDiagnosticsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ProvideTenantDiagnosticsRequest`.
- **`ProvideTenantDiagnosticsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ProvideTenantDiagnosticsHandler`** — application handler that loads authorized state,
  invokes `ProvideTenantDiagnosticsPolicy`, and commits one result.
- **`ProvideTenantDiagnosticsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IProvideTenantDiagnosticsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ProvideTenantDiagnosticsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-11` | `L1-OBS-09` | Authorized administrators/support shall generate a bounded diagnostic bundle containing product/config/schema versions, safe job/error summaries, capability state, health indicators, correlations, and timestamps. Bundle access/generation/download shall be audited and filtered to tenant scope and redaction policy. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for provide tenant diagnostics](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for provide tenant diagnostics](diagrams/c4-container.png)

### Components

`ProvideTenantDiagnosticsController` dispatches `ProvideTenantDiagnosticsRequest` to `ProvideTenantDiagnosticsHandler`. The handler
uses `ProvideTenantDiagnosticsPolicy` and `IProvideTenantDiagnosticsRepository` before it commits a state change.

![C4 component view for provide tenant diagnostics](diagrams/c4-component.png)

### Class structure

`ProvideTenantDiagnosticsHandler` depends on the request, policy, and repository abstractions.
`IProvideTenantDiagnosticsRepository` stores `ProvideTenantDiagnosticsRecord` under tenant and version context.

![Class diagram for provide tenant diagnostics](diagrams/class-structure.png)

### Behaviour — tenant-safe diagnostic bundle

The sequence applies `L2-OBS-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for tenant-safe diagnostic bundle](diagrams/sequence-l2-obs-11.png)
