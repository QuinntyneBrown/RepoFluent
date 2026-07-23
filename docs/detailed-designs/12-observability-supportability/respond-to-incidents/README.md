# Respond to incidents

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *incident response readiness* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RespondToIncidentsConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RespondToIncidentsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RespondToIncidentsRequest`.
- **`RespondToIncidentsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RespondToIncidentsHandler`** — application handler that loads authorized state,
  invokes `RespondToIncidentsPolicy`, and commits one result.
- **`RespondToIncidentsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRespondToIncidentsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RespondToIncidentsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-15` | `L1-OBS-07` | The incident plan shall define detection, triage, severity, roles, containment, evidence preservation, tenant/customer/legal communication, recovery, post-incident review, and escalation for security, privacy, availability, data integrity, and protected-answer incidents. Contact paths and runbooks shall be exercised. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for respond to incidents](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for respond to incidents](diagrams/c4-container.png)

### Components

`RespondToIncidentsController` dispatches `RespondToIncidentsRequest` to `RespondToIncidentsHandler`. The handler
uses `RespondToIncidentsPolicy` and `IRespondToIncidentsRepository` before it commits a state change.

![C4 component view for respond to incidents](diagrams/c4-component.png)

### Class structure

`RespondToIncidentsHandler` depends on the request, policy, and repository abstractions.
`IRespondToIncidentsRepository` stores `RespondToIncidentsRecord` under tenant and version context.

![Class diagram for respond to incidents](diagrams/class-structure.png)

### Behaviour — incident response readiness

The sequence applies `L2-OBS-15` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for incident response readiness](diagrams/sequence-l2-obs-15.png)
