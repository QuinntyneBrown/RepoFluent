# Export reports

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *report export* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ExportReportsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ExportReportsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ExportReportsRequest`.
- **`ExportReportsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ExportReportsHandler`** — application handler that loads authorized state,
  invokes `ExportReportsPolicy`, and commits one result.
- **`ExportReportsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IExportReportsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ExportReportsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-10` | `L1-ANR-07` | Exports shall use a documented common machine-readable format, stable columns/schema version, applied filters, population/time/version labels, metric-definition versions, generated time, and safe null/suppression representation. Generation, download, expiry, and failure shall be authorized and audited. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for export reports](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for export reports](diagrams/c4-container.png)

### Components

`ExportReportsController` dispatches `ExportReportsRequest` to `ExportReportsHandler`. The handler
uses `ExportReportsPolicy` and `IExportReportsRepository` before it commits a state change.

![C4 component view for export reports](diagrams/c4-component.png)

### Class structure

`ExportReportsHandler` depends on the request, policy, and repository abstractions.
`IExportReportsRepository` stores `ExportReportsRecord` under tenant and version context.

![Class diagram for export reports](diagrams/class-structure.png)

### Behaviour — report export

The sequence applies `L2-ANR-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for report export](diagrams/sequence-l2-anr-10.png)
