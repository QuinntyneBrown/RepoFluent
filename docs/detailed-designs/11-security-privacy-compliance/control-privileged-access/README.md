# Control privileged access

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *least-privilege service and human access* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ControlPrivilegedAccessPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ControlPrivilegedAccessController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ControlPrivilegedAccessRequest`.
- **`ControlPrivilegedAccessRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ControlPrivilegedAccessHandler`** — application handler that loads authorized state,
  invokes `ControlPrivilegedAccessPolicy`, and commits one result.
- **`ControlPrivilegedAccessPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IControlPrivilegedAccessRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ControlPrivilegedAccessRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-02` | `L1-SPC-01` | Service identities and human operational roles shall receive only the actions/data needed for documented duties, separated by environment and sensitivity. Privileged access shall be approved, time/scoped where supported, authenticated strongly, and audited. Support diagnostics shall not grant implicit curriculum access. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for control privileged access](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for control privileged access](diagrams/c4-container.png)

### Components

`ControlPrivilegedAccessController` dispatches `ControlPrivilegedAccessRequest` to `ControlPrivilegedAccessHandler`. The handler
uses `ControlPrivilegedAccessPolicy` and `IControlPrivilegedAccessRepository` before it commits a state change.

![C4 component view for control privileged access](diagrams/c4-component.png)

### Class structure

`ControlPrivilegedAccessHandler` depends on the request, policy, and repository abstractions.
`IControlPrivilegedAccessRepository` stores `ControlPrivilegedAccessRecord` under tenant and version context.

![Class diagram for control privileged access](diagrams/class-structure.png)

### Behaviour — least-privilege service and human access

The sequence applies `L2-SPC-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for least-privilege service and human access](diagrams/sequence-l2-spc-02.png)
