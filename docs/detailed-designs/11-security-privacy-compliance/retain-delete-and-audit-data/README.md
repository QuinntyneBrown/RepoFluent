# Retain, delete, and audit data

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *retention, legal hold, and deletion coverage*, *audit-event integrity* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RetainDeleteAndAuditDataPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RetainDeleteAndAuditDataController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RetainDeleteAndAuditDataRequest`.
- **`RetainDeleteAndAuditDataRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RetainDeleteAndAuditDataHandler`** — application handler that loads authorized state,
  invokes `RetainDeleteAndAuditDataPolicy`, and commits one result.
- **`RetainDeleteAndAuditDataPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRetainDeleteAndAuditDataRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RetainDeleteAndAuditDataRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-12` | `L1-SPC-07` | The data inventory shall map each data class to configured retention, hold, deletion, and backup-expiry behavior across primary stores, search/index, caches, analytics derivatives, exports, user artifacts, queues, and replicas. Holds shall prevent prohibited deletion; expiry shall not bypass immutable audit/evidence duties. |
| `L2-SPC-13` | `L1-SPC-08` | Audit records shall be append-only/tamper-evident under the selected architecture, tenant-scoped, time-synchronized, access-controlled, queryable by authorized Auditors, and retained under approved policy. Required events shall include administrative access, package upload/validation/review/approval/publication/retirement, assignments, role changes, report exports, retention/deletion, and sensitive content access. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for retain, delete, and audit data](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for retain, delete, and audit data](diagrams/c4-container.png)

### Components

`RetainDeleteAndAuditDataController` dispatches `RetainDeleteAndAuditDataRequest` to `RetainDeleteAndAuditDataHandler`. The handler
uses `RetainDeleteAndAuditDataPolicy` and `IRetainDeleteAndAuditDataRepository` before it commits a state change.

![C4 component view for retain, delete, and audit data](diagrams/c4-component.png)

### Class structure

`RetainDeleteAndAuditDataHandler` depends on the request, policy, and repository abstractions.
`IRetainDeleteAndAuditDataRepository` stores `RetainDeleteAndAuditDataRecord` under tenant and version context.

![Class diagram for retain, delete, and audit data](diagrams/class-structure.png)

### Behaviour — retention, legal hold, and deletion coverage

The sequence applies `L2-SPC-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for retention, legal hold, and deletion coverage](diagrams/sequence-l2-spc-12.png)

### Behaviour — audit-event integrity

The sequence applies `L2-SPC-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for audit-event integrity](diagrams/sequence-l2-spc-13.png)
