# Access support diagnostics

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *safe support diagnostics* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`AccessSupportDiagnosticsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`AccessSupportDiagnosticsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `AccessSupportDiagnosticsRequest`.
- **`AccessSupportDiagnosticsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`AccessSupportDiagnosticsHandler`** — application handler that loads authorized state,
  invokes `AccessSupportDiagnosticsPolicy`, and commits one result.
- **`AccessSupportDiagnosticsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IAccessSupportDiagnosticsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`AccessSupportDiagnosticsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-10` | `L1-ATO-04` | Tenant diagnostics shall show service status relevant to the tenant, processing job status, recent safe error identifiers, client/browser capability summary where provided, configuration versions, and support correlation data. Source excerpts, answer data, secrets, tokens, stack traces, and unrelated tenant metadata shall be excluded. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for access support diagnostics](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for access support diagnostics](diagrams/c4-container.png)

### Components

`AccessSupportDiagnosticsController` dispatches `AccessSupportDiagnosticsRequest` to `AccessSupportDiagnosticsHandler`. The handler
uses `AccessSupportDiagnosticsPolicy` and `IAccessSupportDiagnosticsRepository` before it commits a state change.

![C4 component view for access support diagnostics](diagrams/c4-component.png)

### Class structure

`AccessSupportDiagnosticsHandler` depends on the request, policy, and repository abstractions.
`IAccessSupportDiagnosticsRepository` stores `AccessSupportDiagnosticsRecord` under tenant and version context.

![Class diagram for access support diagnostics](diagrams/class-structure.png)

### Behaviour — safe support diagnostics

The sequence applies `L2-ATO-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for safe support diagnostics](diagrams/sequence-l2-ato-10.png)
