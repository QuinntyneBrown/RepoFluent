# Show learner analytics

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *learner self-reporting view* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ShowLearnerAnalyticsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ShowLearnerAnalyticsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ShowLearnerAnalyticsRequest`.
- **`ShowLearnerAnalyticsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ShowLearnerAnalyticsHandler`** — application handler that loads authorized state,
  invokes `ShowLearnerAnalyticsPolicy`, and commits one result.
- **`ShowLearnerAnalyticsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IShowLearnerAnalyticsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ShowLearnerAnalyticsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-02` | `L1-ANR-01` | The learner view shall report only the authenticated learner’s assignments, state, due status, course/objective completion, assessment results whose feedback is released, objective coverage/mastery, recency, and recommended next actions. It shall link each value to understandable source context where appropriate. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for show learner analytics](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for show learner analytics](diagrams/c4-container.png)

### Components

`ShowLearnerAnalyticsController` dispatches `ShowLearnerAnalyticsRequest` to `ShowLearnerAnalyticsHandler`. The handler
uses `ShowLearnerAnalyticsPolicy` and `IShowLearnerAnalyticsRepository` before it commits a state change.

![C4 component view for show learner analytics](diagrams/c4-component.png)

### Class structure

`ShowLearnerAnalyticsHandler` depends on the request, policy, and repository abstractions.
`IShowLearnerAnalyticsRepository` stores `ShowLearnerAnalyticsRecord` under tenant and version context.

![Class diagram for show learner analytics](diagrams/class-structure.png)

### Behaviour — learner self-reporting view

The sequence applies `L2-ANR-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for learner self-reporting view](diagrams/sequence-l2-anr-02.png)
