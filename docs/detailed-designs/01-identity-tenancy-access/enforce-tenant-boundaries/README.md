# Enforce tenant boundaries

## Overview

RepoFluent's Identity, Tenancy, and Access subsystem establishes tenant identity, authentication, authorization, groups, sessions, and access evidence. This feature
brings *mandatory tenant context*, *secure failure and availability behavior* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Identity administration.
RepoFluent Identity API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`EnforceTenantBoundariesPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`IdentityAccessApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`EnforceTenantBoundariesController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `EnforceTenantBoundariesRequest`.
- **`EnforceTenantBoundariesRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`EnforceTenantBoundariesHandler`** — application handler that loads authorized state,
  invokes `EnforceTenantBoundariesPolicy`, and commits one result.
- **`EnforceTenantBoundariesPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IEnforceTenantBoundariesRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`EnforceTenantBoundariesRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ITA-01` | `L1-ITA-01` | Every authenticated principal, session, service credential, persisted identity record, and authorization request shall carry a server-resolved tenant identifier. Repositories and query services shall apply the tenant predicate independently of client-supplied filters. Cross-tenant identifiers shall be treated as nonexistent to the requesting actor. |
| `L2-ITA-11` | `L1-ITA-09` | Missing policy data, unavailable authorization dependencies, malformed identifiers, or inconsistent tenant context shall fail closed for protected operations. User-facing errors shall use safe identifiers; operational telemetry shall permit diagnosis without storing credentials or protected token material. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Enterprise identity provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for enforce tenant boundaries](diagrams/c4-context.png)

### Containers

Identity administration sends typed requests to RepoFluent Identity API. The API applies
server-owned rules and records the accepted outcome in Identity and access store.

![C4 container view for enforce tenant boundaries](diagrams/c4-container.png)

### Components

`EnforceTenantBoundariesController` dispatches `EnforceTenantBoundariesRequest` to `EnforceTenantBoundariesHandler`. The handler
uses `EnforceTenantBoundariesPolicy` and `IEnforceTenantBoundariesRepository` before it commits a state change.

![C4 component view for enforce tenant boundaries](diagrams/c4-component.png)

### Class structure

`EnforceTenantBoundariesHandler` depends on the request, policy, and repository abstractions.
`IEnforceTenantBoundariesRepository` stores `EnforceTenantBoundariesRecord` under tenant and version context.

![Class diagram for enforce tenant boundaries](diagrams/class-structure.png)

### Behaviour — mandatory tenant context

The sequence applies `L2-ITA-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for mandatory tenant context](diagrams/sequence-l2-ita-01.png)

### Behaviour — secure failure and availability behavior

The sequence applies `L2-ITA-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for secure failure and availability behavior](diagrams/sequence-l2-ita-11.png)
