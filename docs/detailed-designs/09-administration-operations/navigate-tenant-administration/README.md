# Navigate tenant administration

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *administrative information architecture* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`NavigateTenantAdministrationPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`NavigateTenantAdministrationController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `NavigateTenantAdministrationRequest`.
- **`NavigateTenantAdministrationRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`NavigateTenantAdministrationHandler`** — application handler that loads authorized state,
  invokes `NavigateTenantAdministrationPolicy`, and commits one result.
- **`NavigateTenantAdministrationPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`INavigateTenantAdministrationRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`NavigateTenantAdministrationRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-01` | `L1-ATO-01` | The administration experience shall provide tenant-scoped areas for users, groups, roles/access, curricula/versions, assignments, tenant policy/settings, retention, integrations where enabled, audit access, and support diagnostics. Navigation and API discovery shall show only capabilities authorized for the actor. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for navigate tenant administration](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for navigate tenant administration](diagrams/c4-container.png)

### Components

`NavigateTenantAdministrationController` dispatches `NavigateTenantAdministrationRequest` to `NavigateTenantAdministrationHandler`. The handler
uses `NavigateTenantAdministrationPolicy` and `INavigateTenantAdministrationRepository` before it commits a state change.

![C4 component view for navigate tenant administration](diagrams/c4-component.png)

### Class structure

`NavigateTenantAdministrationHandler` depends on the request, policy, and repository abstractions.
`INavigateTenantAdministrationRepository` stores `NavigateTenantAdministrationRecord` under tenant and version context.

![Class diagram for navigate tenant administration](diagrams/class-structure.png)

### Behaviour — administrative information architecture

The sequence applies `L2-ATO-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for administrative information architecture](diagrams/sequence-l2-ato-01.png)
