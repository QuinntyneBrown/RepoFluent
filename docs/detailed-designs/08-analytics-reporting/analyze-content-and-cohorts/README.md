# Analyze content and cohorts

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *content-quality signals*, *cohort comparison* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`AnalyzeContentAndCohortsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`AnalyzeContentAndCohortsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `AnalyzeContentAndCohortsRequest`.
- **`AnalyzeContentAndCohortsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`AnalyzeContentAndCohortsHandler`** — application handler that loads authorized state,
  invokes `AnalyzeContentAndCohortsPolicy`, and commits one result.
- **`AnalyzeContentAndCohortsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IAnalyzeContentAndCohortsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`AnalyzeContentAndCohortsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-11` | `L1-ANR-08` | Content-quality reporting should measure defined abandonment, repeated failure, attempt patterns, item difficulty/discrimination where statistically valid, learner feedback, render errors, and remediation usage. It shall display sample size and avoid item discrimination claims below the approved evidence threshold. |
| `L2-ANR-12` | `L1-ANR-09` | Comparisons should require explicit populations, metric/version definitions, curriculum versions, date windows, and inclusion criteria. Differences in population, assignment, content version, or window shall be labeled prominently. Minimum-group policy applies independently to each side. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for analyze content and cohorts](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for analyze content and cohorts](diagrams/c4-container.png)

### Components

`AnalyzeContentAndCohortsController` dispatches `AnalyzeContentAndCohortsRequest` to `AnalyzeContentAndCohortsHandler`. The handler
uses `AnalyzeContentAndCohortsPolicy` and `IAnalyzeContentAndCohortsRepository` before it commits a state change.

![C4 component view for analyze content and cohorts](diagrams/c4-component.png)

### Class structure

`AnalyzeContentAndCohortsHandler` depends on the request, policy, and repository abstractions.
`IAnalyzeContentAndCohortsRepository` stores `AnalyzeContentAndCohortsRecord` under tenant and version context.

![Class diagram for analyze content and cohorts](diagrams/class-structure.png)

### Behaviour — content-quality signals

The sequence applies `L2-ANR-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for content-quality signals](diagrams/sequence-l2-anr-11.png)

### Behaviour — cohort comparison

The sequence applies `L2-ANR-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for cohort comparison](diagrams/sequence-l2-anr-12.png)
