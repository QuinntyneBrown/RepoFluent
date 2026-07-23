# Cite sources and uncertainty

## Overview

RepoFluent's Agent Authoring Kit subsystem guides approved agents from declared source scope to a locally validated curriculum package. This feature
brings *source citation procedure*, *uncertainty report* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum authoring agent starts the outcome through Authoring Kit CLI.
Local Validator applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`CiteSourcesAndUncertaintyCli`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`AuthoringKitClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`CiteSourcesAndUncertaintyController`** — .NET boundary that authenticates
  the caller, applies endpoint policy, and dispatches `CiteSourcesAndUncertaintyRequest`.
- **`CiteSourcesAndUncertaintyRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`CiteSourcesAndUncertaintyHandler`** — application handler that loads authorized state,
  invokes `CiteSourcesAndUncertaintyPolicy`, and commits one result.
- **`CiteSourcesAndUncertaintyPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ICiteSourcesAndUncertaintyRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`CiteSourcesAndUncertaintyRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-05` | `L1-AAK-03` | The kit shall define how to create repository-relative and document citations, bind them to the source snapshot, associate them with claims/objectives, and distinguish direct evidence from synthesis or interpretation. |
| `L2-AAK-06` | `L1-AAK-04` | The authoring workflow shall produce a structured report of assumptions, confidence, conflicting evidence, missing context, omissions, and unresolved questions. Material uncertainty shall also be represented in the package where the learner/reviewer needs it. |

## Diagrams

### System context

The curriculum authoring agent uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Approved source repositories only through the boundary
described by the requirements and approved configuration.

![C4 system context for cite sources and uncertainty](diagrams/c4-context.png)

### Containers

Authoring Kit CLI sends typed requests to Local Validator. The API applies
server-owned rules and records the accepted outcome in Authoring workspace.

![C4 container view for cite sources and uncertainty](diagrams/c4-container.png)

### Components

`CiteSourcesAndUncertaintyController` dispatches `CiteSourcesAndUncertaintyRequest` to `CiteSourcesAndUncertaintyHandler`. The handler
uses `CiteSourcesAndUncertaintyPolicy` and `ICiteSourcesAndUncertaintyRepository` before it commits a state change.

![C4 component view for cite sources and uncertainty](diagrams/c4-component.png)

### Class structure

`CiteSourcesAndUncertaintyHandler` depends on the request, policy, and repository abstractions.
`ICiteSourcesAndUncertaintyRepository` stores `CiteSourcesAndUncertaintyRecord` under tenant and version context.

![Class diagram for cite sources and uncertainty](diagrams/class-structure.png)

### Behaviour — source citation procedure

The sequence applies `L2-AAK-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for source citation procedure](diagrams/sequence-l2-aak-05.png)

### Behaviour — uncertainty report

The sequence applies `L2-AAK-06` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for uncertainty report](diagrams/sequence-l2-aak-06.png)
