# Isolate tenants and identifiers

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *tenant isolation controls*, *identifier boundary protection* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`IsolateTenantsAndIdentifiersPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`IsolateTenantsAndIdentifiersController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `IsolateTenantsAndIdentifiersRequest`.
- **`IsolateTenantsAndIdentifiersRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`IsolateTenantsAndIdentifiersHandler`** — application handler that loads authorized state,
  invokes `IsolateTenantsAndIdentifiersPolicy`, and commits one result.
- **`IsolateTenantsAndIdentifiersPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IIsolateTenantsAndIdentifiersRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`IsolateTenantsAndIdentifiersRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-01` | `L1-SPC-01` | Tenant identity shall be server-resolved and propagated through storage, cache, search, queue, object, analytics, export, audit, and telemetry boundaries. Data-access layers shall require tenant context and use tenant-aware keys/partitions/predicates. Background work shall bind to one tenant and reject ambiguous context. |
| `L2-SPC-17` | `L1-SPC-11` | Package-supplied stable identifiers shall remain namespaced under platform tenant/package/version records and shall never be used directly as global authorization or storage ownership keys. Collisions shall not overwrite entities across packages, versions, or tenants. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for isolate tenants and identifiers](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for isolate tenants and identifiers](diagrams/c4-container.png)

### Components

`IsolateTenantsAndIdentifiersController` dispatches `IsolateTenantsAndIdentifiersRequest` to `IsolateTenantsAndIdentifiersHandler`. The handler
uses `IsolateTenantsAndIdentifiersPolicy` and `IIsolateTenantsAndIdentifiersRepository` before it commits a state change.

![C4 component view for isolate tenants and identifiers](diagrams/c4-component.png)

### Class structure

`IsolateTenantsAndIdentifiersHandler` depends on the request, policy, and repository abstractions.
`IIsolateTenantsAndIdentifiersRepository` stores `IsolateTenantsAndIdentifiersRecord` under tenant and version context.

![Class diagram for isolate tenants and identifiers](diagrams/class-structure.png)

### Behaviour — tenant isolation controls

The sequence applies `L2-SPC-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for tenant isolation controls](diagrams/sequence-l2-spc-01.png)

### Behaviour — identifier boundary protection

The sequence applies `L2-SPC-17` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for identifier boundary protection](diagrams/sequence-l2-spc-17.png)
