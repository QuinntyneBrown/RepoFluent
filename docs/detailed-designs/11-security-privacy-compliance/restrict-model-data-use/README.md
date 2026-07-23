# Restrict model data use

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *shared-model training prohibition* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RestrictModelDataUsePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RestrictModelDataUseController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RestrictModelDataUseRequest`.
- **`RestrictModelDataUseRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RestrictModelDataUseHandler`** — application handler that loads authorized state,
  invokes `RestrictModelDataUsePolicy`, and commits one result.
- **`RestrictModelDataUsePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRestrictModelDataUseRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RestrictModelDataUseRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-05` | `L1-SPC-03` | RepoFluent shall classify source code, documents, prompts, curriculum, answer keys, learner activity, and analytics as customer data. Product integrations, support tooling, and model/agent providers shall not use it for shared training unless the customer completes an explicit, separate, documented authorization process with defined scope and revocation. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for restrict model data use](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for restrict model data use](diagrams/c4-container.png)

### Components

`RestrictModelDataUseController` dispatches `RestrictModelDataUseRequest` to `RestrictModelDataUseHandler`. The handler
uses `RestrictModelDataUsePolicy` and `IRestrictModelDataUseRepository` before it commits a state change.

![C4 component view for restrict model data use](diagrams/c4-component.png)

### Class structure

`RestrictModelDataUseHandler` depends on the request, policy, and repository abstractions.
`IRestrictModelDataUseRepository` stores `RestrictModelDataUseRecord` under tenant and version context.

![Class diagram for restrict model data use](diagrams/class-structure.png)

### Behaviour — shared-model training prohibition

The sequence applies `L2-SPC-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for shared-model training prohibition](diagrams/sequence-l2-spc-05.png)
