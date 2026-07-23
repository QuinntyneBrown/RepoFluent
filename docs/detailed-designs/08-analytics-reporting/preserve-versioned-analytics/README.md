# Preserve versioned analytics

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *curriculum-version history*, *freshness and late events*, *metric reconciliation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`PreserveVersionedAnalyticsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`PreserveVersionedAnalyticsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `PreserveVersionedAnalyticsRequest`.
- **`PreserveVersionedAnalyticsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`PreserveVersionedAnalyticsHandler`** — application handler that loads authorized state,
  invokes `PreserveVersionedAnalyticsPolicy`, and commits one result.
- **`PreserveVersionedAnalyticsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IPreserveVersionedAnalyticsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`PreserveVersionedAnalyticsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-13` | `L1-ANR-03` | All learning evidence shall aggregate under its originating curriculum/item/calculation versions. Cross-version rollups shall be explicit and shall preserve version breakdown. Retirement or publication of a new version shall not rewrite historic aggregates. |
| `L2-ANR-14` | `L1-ANR-11` | Every analytics surface shall provide data freshness appropriate to its use. Late, retried, or corrected source events shall be processed idempotently, recalculate affected aggregates, and preserve correction lineage. Stale pipelines shall be visible and monitored. |
| `L2-ANR-15` | `L1-ANR-11` | The subsystem shall provide repeatable controls that reconcile source assignment/progress/attempt/mastery records to aggregates and exports for a selected tenant, version, population, and period. Material discrepancies shall block metric release or raise an operational incident according to threshold. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for preserve versioned analytics](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for preserve versioned analytics](diagrams/c4-container.png)

### Components

`PreserveVersionedAnalyticsController` dispatches `PreserveVersionedAnalyticsRequest` to `PreserveVersionedAnalyticsHandler`. The handler
uses `PreserveVersionedAnalyticsPolicy` and `IPreserveVersionedAnalyticsRepository` before it commits a state change.

![C4 component view for preserve versioned analytics](diagrams/c4-component.png)

### Class structure

`PreserveVersionedAnalyticsHandler` depends on the request, policy, and repository abstractions.
`IPreserveVersionedAnalyticsRepository` stores `PreserveVersionedAnalyticsRecord` under tenant and version context.

![Class diagram for preserve versioned analytics](diagrams/class-structure.png)

### Behaviour — curriculum-version history

The sequence applies `L2-ANR-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for curriculum-version history](diagrams/sequence-l2-anr-13.png)

### Behaviour — freshness and late events

The sequence applies `L2-ANR-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for freshness and late events](diagrams/sequence-l2-anr-14.png)

### Behaviour — metric reconciliation

The sequence applies `L2-ANR-15` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for metric reconciliation](diagrams/sequence-l2-anr-15.png)
