# Explore manager analytics

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *manager aggregate dashboard*, *drill-down authorization*, *minimum-group privacy* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ExploreManagerAnalyticsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ExploreManagerAnalyticsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ExploreManagerAnalyticsRequest`.
- **`ExploreManagerAnalyticsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ExploreManagerAnalyticsHandler`** — application handler that loads authorized state,
  invokes `ExploreManagerAnalyticsPolicy`, and commits one result.
- **`ExploreManagerAnalyticsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IExploreManagerAnalyticsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ExploreManagerAnalyticsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-03` | `L1-ANR-02` | Authorized managers shall filter an authorized population by time, curriculum/version, course, system/subsystem, objective, assignment state, and cohort/team. Aggregates shall include participation, completion, mastery distribution, assessment distribution, active learning time, and common gaps with denominators and freshness. |
| `L2-ANR-04` | `L1-ANR-03` | Every drill-down shall re-evaluate authorization and minimum-group policy at the target grain. A visible aggregate shall not automatically authorize individual detail. Filters shall carry explicit version/population context and shall not be client-trusted. |
| `L2-ANR-09` | `L1-ANR-06` | Tenant policy shall define a minimum reporting group within platform bounds. Counts, aggregates, distributions, filters, comparisons, totals, tooltips, exports, and differencing-prone queries shall suppress or coarsen results below the threshold. Authorized individual views shall require a separate explicit grant. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for explore manager analytics](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for explore manager analytics](diagrams/c4-container.png)

### Components

`ExploreManagerAnalyticsController` dispatches `ExploreManagerAnalyticsRequest` to `ExploreManagerAnalyticsHandler`. The handler
uses `ExploreManagerAnalyticsPolicy` and `IExploreManagerAnalyticsRepository` before it commits a state change.

![C4 component view for explore manager analytics](diagrams/c4-component.png)

### Class structure

`ExploreManagerAnalyticsHandler` depends on the request, policy, and repository abstractions.
`IExploreManagerAnalyticsRepository` stores `ExploreManagerAnalyticsRecord` under tenant and version context.

![Class diagram for explore manager analytics](diagrams/class-structure.png)

### Behaviour — manager aggregate dashboard

The sequence applies `L2-ANR-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for manager aggregate dashboard](diagrams/sequence-l2-anr-03.png)

### Behaviour — drill-down authorization

The sequence applies `L2-ANR-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for drill-down authorization](diagrams/sequence-l2-anr-04.png)

### Behaviour — minimum-group privacy

The sequence applies `L2-ANR-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for minimum-group privacy](diagrams/sequence-l2-anr-09.png)
