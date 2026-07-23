# Administer curricula and status

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *curriculum administration*, *processing and publication status* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`AdministerCurriculaAndStatusPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`AdministerCurriculaAndStatusController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `AdministerCurriculaAndStatusRequest`.
- **`AdministerCurriculaAndStatusRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`AdministerCurriculaAndStatusHandler`** — application handler that loads authorized state,
  invokes `AdministerCurriculaAndStatusPolicy`, and commits one result.
- **`AdministerCurriculaAndStatusPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IAdministerCurriculaAndStatusRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`AdministerCurriculaAndStatusRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-04` | `L1-ATO-01` | Authorized users shall list curricula by lifecycle state/version, inspect ownership/source snapshot/validation/review/publication data, invoke only permitted lifecycle actions, and identify current assignment use. Administrative actions shall delegate to lifecycle gates rather than altering content state directly. |
| `L2-ATO-07` | `L1-ATO-02` | Status shall show lifecycle state, active/completed stages, start/update timestamps, validation counts by severity, warning acknowledgement, review decision, publication state, safe error summary, retry availability, and correlation identifier. Updates should occur without requiring a full-page refresh. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for administer curricula and status](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for administer curricula and status](diagrams/c4-container.png)

### Components

`AdministerCurriculaAndStatusController` dispatches `AdministerCurriculaAndStatusRequest` to `AdministerCurriculaAndStatusHandler`. The handler
uses `AdministerCurriculaAndStatusPolicy` and `IAdministerCurriculaAndStatusRepository` before it commits a state change.

![C4 component view for administer curricula and status](diagrams/c4-component.png)

### Class structure

`AdministerCurriculaAndStatusHandler` depends on the request, policy, and repository abstractions.
`IAdministerCurriculaAndStatusRepository` stores `AdministerCurriculaAndStatusRecord` under tenant and version context.

![Class diagram for administer curricula and status](diagrams/class-structure.png)

### Behaviour — curriculum administration

The sequence applies `L2-ATO-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for curriculum administration](diagrams/sequence-l2-ato-04.png)

### Behaviour — processing and publication status

The sequence applies `L2-ATO-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for processing and publication status](diagrams/sequence-l2-ato-07.png)
