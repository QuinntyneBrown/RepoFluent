# Record identity audit evidence

## Overview

RepoFluent's Identity, Tenancy, and Access subsystem establishes tenant identity, authentication, authorization, groups, sessions, and access evidence. This feature
brings *identity audit evidence* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Identity administration.
RepoFluent Identity API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RecordIdentityAuditEvidencePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`IdentityAccessApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RecordIdentityAuditEvidenceController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RecordIdentityAuditEvidenceRequest`.
- **`RecordIdentityAuditEvidenceRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RecordIdentityAuditEvidenceHandler`** — application handler that loads authorized state,
  invokes `RecordIdentityAuditEvidencePolicy`, and commits one result.
- **`RecordIdentityAuditEvidencePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRecordIdentityAuditEvidenceRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RecordIdentityAuditEvidenceRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ITA-07` | `L1-ITA-05` | The subsystem shall emit immutable audit events for invitations, sign-in security events, sign-out or revocation, user activation/deactivation, group membership changes, role grants/removals, policy changes, and provisioning results. Events shall include tenant, actor or system principal, subject, action, result, timestamp, and correlation identifier. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Enterprise identity provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for record identity audit evidence](diagrams/c4-context.png)

### Containers

Identity administration sends typed requests to RepoFluent Identity API. The API applies
server-owned rules and records the accepted outcome in Identity and access store.

![C4 container view for record identity audit evidence](diagrams/c4-container.png)

### Components

`RecordIdentityAuditEvidenceController` dispatches `RecordIdentityAuditEvidenceRequest` to `RecordIdentityAuditEvidenceHandler`. The handler
uses `RecordIdentityAuditEvidencePolicy` and `IRecordIdentityAuditEvidenceRepository` before it commits a state change.

![C4 component view for record identity audit evidence](diagrams/c4-component.png)

### Class structure

`RecordIdentityAuditEvidenceHandler` depends on the request, policy, and repository abstractions.
`IRecordIdentityAuditEvidenceRepository` stores `RecordIdentityAuditEvidenceRecord` under tenant and version context.

![Class diagram for record identity audit evidence](diagrams/class-structure.png)

### Behaviour — identity audit evidence

The sequence applies `L2-ITA-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for identity audit evidence](diagrams/sequence-l2-ita-07.png)
