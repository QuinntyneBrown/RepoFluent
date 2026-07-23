# Support contract extensions

## Overview

RepoFluent's Curriculum Input Contract subsystem defines the portable curriculum package, its compatibility rules, and its conformance artifacts. This feature
brings *extension mechanism* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The contract maintainer starts the outcome through Contract workbench.
Contract Registry API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`SupportContractExtensionsWorkbench`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`ContractRegistryClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`SupportContractExtensionsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `SupportContractExtensionsRequest`.
- **`SupportContractExtensionsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`SupportContractExtensionsHandler`** — application handler that loads authorized state,
  invokes `SupportContractExtensionsPolicy`, and commits one result.
- **`SupportContractExtensionsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ISupportContractExtensionsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`SupportContractExtensionsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-13` | `L1-CIC-06` | Extensions shall use a documented namespace mechanism, shall not redefine core fields, and shall be ignorable or rejectable according to declared criticality. Unsupported critical extensions shall block import; unsupported noncritical extensions may produce a warning without changing core interpretation. |

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for support contract extensions](diagrams/c4-context.png)

### Containers

Contract workbench sends typed requests to Contract Registry API. The API applies
server-owned rules and records the accepted outcome in Contract artifact store.

![C4 container view for support contract extensions](diagrams/c4-container.png)

### Components

`SupportContractExtensionsController` dispatches `SupportContractExtensionsRequest` to `SupportContractExtensionsHandler`. The handler
uses `SupportContractExtensionsPolicy` and `ISupportContractExtensionsRepository` before it commits a state change.

![C4 component view for support contract extensions](diagrams/c4-component.png)

### Class structure

`SupportContractExtensionsHandler` depends on the request, policy, and repository abstractions.
`ISupportContractExtensionsRepository` stores `SupportContractExtensionsRecord` under tenant and version context.

![Class diagram for support contract extensions](diagrams/class-structure.png)

### Behaviour — extension mechanism

The sequence applies `L2-CIC-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for extension mechanism](diagrams/sequence-l2-cic-13.png)
