# Standardize telemetry and correlation

## Overview

RepoFluent's Observability and Supportability subsystem provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates. This feature
brings *telemetry event envelope*, *domain telemetry coverage*, *end-to-end correlation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The platform operator starts the outcome through Operations console.
Operations API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`StandardizeTelemetryAndCorrelationConsole`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`OperationsApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`StandardizeTelemetryAndCorrelationController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `StandardizeTelemetryAndCorrelationRequest`.
- **`StandardizeTelemetryAndCorrelationRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`StandardizeTelemetryAndCorrelationHandler`** — application handler that loads authorized state,
  invokes `StandardizeTelemetryAndCorrelationPolicy`, and commits one result.
- **`StandardizeTelemetryAndCorrelationPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IStandardizeTelemetryAndCorrelationRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`StandardizeTelemetryAndCorrelationRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-OBS-01` | `L1-OBS-01` | Structured events shall use a versioned envelope containing event name/version, timestamp, environment, service/component, outcome, safe correlation/trace/span identifiers, tenant pseudonymous or approved identifier, actor type where safe, operation/entity type, duration/error category, and schema version. Payload size and cardinality shall be bounded. |
| `L2-OBS-02` | `L1-OBS-01` | Instrumentation shall cover authentication start/result, authorization decision, package receipt/scan/validation/import, renderer success/failure/fallback, progress receive/persist, attempt start/save/submit/grade, lifecycle review/publish/retire, export, and retention workflow. Each domain shall define success, expected rejection, dependency failure, and internal failure categories. |
| `L2-OBS-03` | `L1-OBS-02` | An inbound request shall accept or create a safe correlation/trace identifier and propagate it through synchronous calls, queued work, domain events, audit references, logs, and safe client error response. Untrusted incoming identifiers shall be validated/bounded and shall not replace security ownership context. |

## Diagrams

### System context

The platform operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Monitoring and alerting platform only through the boundary
described by the requirements and approved configuration.

![C4 system context for standardize telemetry and correlation](diagrams/c4-context.png)

### Containers

Operations console sends typed requests to Operations API. The API applies
server-owned rules and records the accepted outcome in Operational telemetry store.

![C4 container view for standardize telemetry and correlation](diagrams/c4-container.png)

### Components

`StandardizeTelemetryAndCorrelationController` dispatches `StandardizeTelemetryAndCorrelationRequest` to `StandardizeTelemetryAndCorrelationHandler`. The handler
uses `StandardizeTelemetryAndCorrelationPolicy` and `IStandardizeTelemetryAndCorrelationRepository` before it commits a state change.

![C4 component view for standardize telemetry and correlation](diagrams/c4-component.png)

### Class structure

`StandardizeTelemetryAndCorrelationHandler` depends on the request, policy, and repository abstractions.
`IStandardizeTelemetryAndCorrelationRepository` stores `StandardizeTelemetryAndCorrelationRecord` under tenant and version context.

![Class diagram for standardize telemetry and correlation](diagrams/class-structure.png)

### Behaviour — telemetry event envelope

The sequence applies `L2-OBS-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for telemetry event envelope](diagrams/sequence-l2-obs-01.png)

### Behaviour — domain telemetry coverage

The sequence applies `L2-OBS-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for domain telemetry coverage](diagrams/sequence-l2-obs-02.png)

### Behaviour — end-to-end correlation

The sequence applies `L2-OBS-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for end-to-end correlation](diagrams/sequence-l2-obs-03.png)
