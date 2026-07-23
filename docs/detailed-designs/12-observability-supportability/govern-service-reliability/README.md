# Govern service reliability

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *service-level objectives and ownership*, *dependency failure and graceful degradation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GovernServiceReliabilityConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GovernServiceReliabilityController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GovernServiceReliabilityRequest`.
- **`GovernServiceReliabilityRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GovernServiceReliabilityHandler`** — application handler that loads authorized state,
  invokes `GovernServiceReliabilityPolicy`, and commits one result.
- **`GovernServiceReliabilityPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGovernServiceReliabilityRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GovernServiceReliabilityRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-12` | `L1-OBS-08` | Before production launch, each critical journey shall have agreed indicators/objectives, measurement source, error-budget rule or equivalent, dashboard, alert threshold, owner, and escalation. At minimum this covers authentication, learner shell, progress write, assessment submit/grade, import-to-preview, and publication. |
| `L2-OBS-16` | `L1-OBS-03` | Critical dependency failure modes shall define timeout, retry/backoff, circuit behavior, idempotency, user outcome, alert, and recovery. Optional GPU/provider/notification/analytics dependencies shall not prevent safe core learning where the PRD requires fallback. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for govern service reliability](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for govern service reliability](diagrams/c4-container.png)

### Components

`GovernServiceReliabilityController` dispatches `GovernServiceReliabilityRequest` to `GovernServiceReliabilityHandler`. The handler
uses `GovernServiceReliabilityPolicy` and `IGovernServiceReliabilityRepository` before it commits a state change.

![C4 component view for govern service reliability](diagrams/c4-component.png)

### Class structure

`GovernServiceReliabilityHandler` depends on the request, policy, and repository abstractions.
`IGovernServiceReliabilityRepository` stores `GovernServiceReliabilityRecord` under tenant and version context.

![Class diagram for govern service reliability](diagrams/class-structure.png)

### Behaviour — service-level objectives and ownership

The sequence applies `L2-OBS-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for service-level objectives and ownership](diagrams/sequence-l2-obs-12.png)

### Behaviour — dependency failure and graceful degradation

The sequence applies `L2-OBS-16` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for dependency failure and graceful degradation](diagrams/sequence-l2-obs-16.png)
