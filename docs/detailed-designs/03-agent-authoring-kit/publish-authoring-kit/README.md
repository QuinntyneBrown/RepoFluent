# Publish the authoring kit

## Overview

RepoFluent's Agent Authoring Kit subsystem guides approved agents from declared source scope to a locally validated curriculum package. This feature
brings *kit contents and release manifest*, *safe offline operation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum authoring agent starts the outcome through Authoring Kit CLI.
Local Validator applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`PublishAuthoringKitCli`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`AuthoringKitClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`PublishAuthoringKitController`** — .NET boundary that authenticates
  the caller, applies endpoint policy, and dispatches `PublishAuthoringKitRequest`.
- **`PublishAuthoringKitRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`PublishAuthoringKitHandler`** — application handler that loads authorized state,
  invokes `PublishAuthoringKitPolicy`, and commits one result.
- **`PublishAuthoringKitPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IPublishAuthoringKitRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`PublishAuthoringKitRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-01` | `L1-AAK-01` | Each kit release shall contain `AGENTS.md`, reusable prompts, applicable `SKILL.md` instructions, the compatible JSON Schema and ICD, valid and invalid examples, a local validation command, release notes, artifact checksums, and a manifest declaring kit, contract, and validator versions. |
| `L2-AAK-12` | `L1-AAK-09` | Schema resolution, fixtures, documentation, and local validation shall function without network access after kit acquisition. Any optional network-dependent feature shall be identified, disabled by default for offline validation, and unnecessary for producing a conformant package. |

## Diagrams

### System context

The curriculum authoring agent uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Approved source repositories only through the boundary
described by the requirements and approved configuration.

![C4 system context for publish the authoring kit](diagrams/c4-context.png)

### Containers

Authoring Kit CLI sends typed requests to Local Validator. The API applies
server-owned rules and records the accepted outcome in Authoring workspace.

![C4 container view for publish the authoring kit](diagrams/c4-container.png)

### Components

`PublishAuthoringKitController` dispatches `PublishAuthoringKitRequest` to `PublishAuthoringKitHandler`. The handler
uses `PublishAuthoringKitPolicy` and `IPublishAuthoringKitRepository` before it commits a state change.

![C4 component view for publish the authoring kit](diagrams/c4-component.png)

### Class structure

`PublishAuthoringKitHandler` depends on the request, policy, and repository abstractions.
`IPublishAuthoringKitRepository` stores `PublishAuthoringKitRecord` under tenant and version context.

![Class diagram for publish the authoring kit](diagrams/class-structure.png)

### Behaviour — kit contents and release manifest

The sequence applies `L2-AAK-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for kit contents and release manifest](diagrams/sequence-l2-aak-01.png)

### Behaviour — safe offline operation

The sequence applies `L2-AAK-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for safe offline operation](diagrams/sequence-l2-aak-12.png)
