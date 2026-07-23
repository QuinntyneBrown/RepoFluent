# Authorize roles and scopes

## Overview

RepoFluent's Identity, Tenancy, and Access subsystem establishes tenant identity, authentication, authorization, groups, sessions, and access evidence. This feature
brings *role and scope policy evaluation*, *role capabilities* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Identity administration.
RepoFluent Identity API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`AuthorizeRolesAndScopesPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`IdentityAccessApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`AuthorizeRolesAndScopesController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `AuthorizeRolesAndScopesRequest`.
- **`AuthorizeRolesAndScopesRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`AuthorizeRolesAndScopesHandler`** — application handler that loads authorized state,
  invokes `AuthorizeRolesAndScopesPolicy`, and commits one result.
- **`AuthorizeRolesAndScopesPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IAuthorizeRolesAndScopesRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`AuthorizeRolesAndScopesRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ITA-04` | `L1-ITA-03` | Authorization shall evaluate the requested action against all actor roles and explicit constraints for tenant, team, curriculum, system, and repository classification. Multiple roles shall combine grants but shall not override an explicit resource restriction. Server-side enforcement shall be authoritative; UI visibility is a convenience, not a security control. |
| `L2-ITA-05` | `L1-ITA-03` | The baseline policy set shall distinguish Learner, Author, Reviewer, Manager, Administrator, and Auditor capabilities as defined by the PRD. Auditor access shall remain read-only. Reviewer approval capability shall not imply administrative publication capability. Manager access shall be limited to explicitly authorized populations. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Enterprise identity provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for authorize roles and scopes](diagrams/c4-context.png)

### Containers

Identity administration sends typed requests to RepoFluent Identity API. The API applies
server-owned rules and records the accepted outcome in Identity and access store.

![C4 container view for authorize roles and scopes](diagrams/c4-container.png)

### Components

`AuthorizeRolesAndScopesController` dispatches `AuthorizeRolesAndScopesRequest` to `AuthorizeRolesAndScopesHandler`. The handler
uses `AuthorizeRolesAndScopesPolicy` and `IAuthorizeRolesAndScopesRepository` before it commits a state change.

![C4 component view for authorize roles and scopes](diagrams/c4-component.png)

### Class structure

`AuthorizeRolesAndScopesHandler` depends on the request, policy, and repository abstractions.
`IAuthorizeRolesAndScopesRepository` stores `AuthorizeRolesAndScopesRecord` under tenant and version context.

![Class diagram for authorize roles and scopes](diagrams/class-structure.png)

### Behaviour — role and scope policy evaluation

The sequence applies `L2-ITA-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for role and scope policy evaluation](diagrams/sequence-l2-ita-04.png)

### Behaviour — role capabilities

The sequence applies `L2-ITA-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for role capabilities](diagrams/sequence-l2-ita-05.png)
