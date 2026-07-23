# Govern metric definitions

## Overview

RepoFluent's Analytics and Reporting subsystem turns versioned learning evidence into authorized, privacy-safe measures and reports. This feature
brings *canonical metric catalog*, *learning state classification*, *component learning measures* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The authorized analytics user starts the outcome through Analytics application.
Analytics API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GovernMetricDefinitionsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AnalyticsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GovernMetricDefinitionsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GovernMetricDefinitionsRequest`.
- **`GovernMetricDefinitionsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GovernMetricDefinitionsHandler`** — application handler that loads authorized state,
  invokes `GovernMetricDefinitionsPolicy`, and commits one result.
- **`GovernMetricDefinitionsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGovernMetricDefinitionsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GovernMetricDefinitionsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ANR-01` | `L1-ANR-10` | The subsystem shall maintain versioned definitions for assignment status, participation, completion, pass/fail, objective coverage, assessment result, mastery, recency/staleness, confidence, learning time, knowledge gap, and high-performance indicators. Each definition shall identify sources, grain, filters, exclusions, time semantics, null behavior, and owning policy version. |
| `L2-ANR-05` | `L1-ANR-04` | Classification shall apply documented precedence and permit simultaneous orthogonal facts where necessary, such as completed-and-failed or passed-and-stale. Views shall not force these facts into a misleading single state. |
| `L2-ANR-06` | `L1-ANR-10` | Reports answering “how much has been learned” shall present assigned completion, objective coverage, demonstrated mastery, assessment performance/attempt history, recency/staleness, and enabled self-confidence as separate measures with appropriate denominators. No unlabeled blended score shall replace them. |

## Diagrams

### System context

The authorized analytics user uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Export delivery service only through the boundary
described by the requirements and approved configuration.

![C4 system context for govern metric definitions](diagrams/c4-context.png)

### Containers

Analytics application sends typed requests to Analytics API. The API applies
server-owned rules and records the accepted outcome in Analytics store.

![C4 container view for govern metric definitions](diagrams/c4-container.png)

### Components

`GovernMetricDefinitionsController` dispatches `GovernMetricDefinitionsRequest` to `GovernMetricDefinitionsHandler`. The handler
uses `GovernMetricDefinitionsPolicy` and `IGovernMetricDefinitionsRepository` before it commits a state change.

![C4 component view for govern metric definitions](diagrams/c4-component.png)

### Class structure

`GovernMetricDefinitionsHandler` depends on the request, policy, and repository abstractions.
`IGovernMetricDefinitionsRepository` stores `GovernMetricDefinitionsRecord` under tenant and version context.

![Class diagram for govern metric definitions](diagrams/class-structure.png)

### Behaviour — canonical metric catalog

The sequence applies `L2-ANR-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for canonical metric catalog](diagrams/sequence-l2-anr-01.png)

### Behaviour — learning state classification

The sequence applies `L2-ANR-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for learning state classification](diagrams/sequence-l2-anr-05.png)

### Behaviour — component learning measures

The sequence applies `L2-ANR-06` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for component learning measures](diagrams/sequence-l2-anr-06.png)
