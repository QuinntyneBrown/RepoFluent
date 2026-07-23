# Manage users, groups, and roles

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *user lifecycle administration*, *group and role administration*, *bulk-operation safety* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ManageUsersGroupsAndRolesPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ManageUsersGroupsAndRolesController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ManageUsersGroupsAndRolesRequest`.
- **`ManageUsersGroupsAndRolesRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ManageUsersGroupsAndRolesHandler`** — application handler that loads authorized state,
  invokes `ManageUsersGroupsAndRolesPolicy`, and commits one result.
- **`ManageUsersGroupsAndRolesPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IManageUsersGroupsAndRolesRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ManageUsersGroupsAndRolesRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-02` | `L1-ATO-01` | Authorized administrators shall invite, view, activate, deactivate, and where policy permits restore tenant users. Deactivation shall revoke active access without deleting historical authorship, approval, assignment, attempt, or audit references. |
| `L2-ATO-03` | `L1-ATO-01` | The UI/API shall manage group membership and role grants using the Identity subsystem policy model, show direct versus inherited provenance, validate scope constraints, and preview loss/gain of access for consequential changes. |
| `L2-ATO-14` | `L1-ATO-01` | Bulk membership, role, assignment, and notification operations shall validate input, preview target counts and exclusions, require confirmation for consequential changes, use an idempotency key, expose per-item outcome, and allow safe retry of failures without duplicating successes. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for manage users, groups, and roles](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for manage users, groups, and roles](diagrams/c4-container.png)

### Components

`ManageUsersGroupsAndRolesController` dispatches `ManageUsersGroupsAndRolesRequest` to `ManageUsersGroupsAndRolesHandler`. The handler
uses `ManageUsersGroupsAndRolesPolicy` and `IManageUsersGroupsAndRolesRepository` before it commits a state change.

![C4 component view for manage users, groups, and roles](diagrams/c4-component.png)

### Class structure

`ManageUsersGroupsAndRolesHandler` depends on the request, policy, and repository abstractions.
`IManageUsersGroupsAndRolesRepository` stores `ManageUsersGroupsAndRolesRecord` under tenant and version context.

![Class diagram for manage users, groups, and roles](diagrams/class-structure.png)

### Behaviour — user lifecycle administration

The sequence applies `L2-ATO-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for user lifecycle administration](diagrams/sequence-l2-ato-02.png)

### Behaviour — group and role administration

The sequence applies `L2-ATO-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for group and role administration](diagrams/sequence-l2-ato-03.png)

### Behaviour — bulk-operation safety

The sequence applies `L2-ATO-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for bulk-operation safety](diagrams/sequence-l2-ato-14.png)
