# Govern retention and deletion

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *retention policy configuration*, *deletion workflow* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GovernRetentionAndDeletionPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GovernRetentionAndDeletionController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GovernRetentionAndDeletionRequest`.
- **`GovernRetentionAndDeletionRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GovernRetentionAndDeletionHandler`** — application handler that loads authorized state,
  invokes `GovernRetentionAndDeletionPolicy`, and commits one result.
- **`GovernRetentionAndDeletionPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGovernRetentionAndDeletionRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GovernRetentionAndDeletionRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-08` | `L1-ATO-03` | Authorized administrators shall view/configure supported retention periods for uploaded packages, drafts, published content, learning records, exports, and user-generated artifacts within legal/platform bounds. Effective date, default, exception, and legal-hold precedence shall be explicit. |
| `L2-ATO-09` | `L1-ATO-03` | Deletion shall be a tracked workflow with request authorization, scope/impact preview, confirmation, hold and audit constraints, queued execution, derived-store/cache/index handling, per-stage status, verification, and immutable proof of disposition that does not retain deleted payloads. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for govern retention and deletion](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for govern retention and deletion](diagrams/c4-container.png)

### Components

`GovernRetentionAndDeletionController` dispatches `GovernRetentionAndDeletionRequest` to `GovernRetentionAndDeletionHandler`. The handler
uses `GovernRetentionAndDeletionPolicy` and `IGovernRetentionAndDeletionRepository` before it commits a state change.

![C4 component view for govern retention and deletion](diagrams/c4-component.png)

### Class structure

`GovernRetentionAndDeletionHandler` depends on the request, policy, and repository abstractions.
`IGovernRetentionAndDeletionRepository` stores `GovernRetentionAndDeletionRecord` under tenant and version context.

![Class diagram for govern retention and deletion](diagrams/class-structure.png)

### Behaviour — retention policy configuration

The sequence applies `L2-ATO-08` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for retention policy configuration](diagrams/sequence-l2-ato-08.png)

### Behaviour — deletion workflow

The sequence applies `L2-ATO-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for deletion workflow](diagrams/sequence-l2-ato-09.png)
