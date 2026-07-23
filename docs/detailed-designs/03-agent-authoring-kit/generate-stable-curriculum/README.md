# Generate stable curriculum

## Overview

RepoFluent's Agent Authoring Kit subsystem guides approved agents from declared source scope to a locally validated curriculum package. This feature
brings *deterministic identity procedure*, *generation manifest* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum authoring agent starts the outcome through Authoring Kit CLI.
Local Validator applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GenerateStableCurriculumCli`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`AuthoringKitClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GenerateStableCurriculumController`** — .NET boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GenerateStableCurriculumRequest`.
- **`GenerateStableCurriculumRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GenerateStableCurriculumHandler`** — application handler that loads authorized state,
  invokes `GenerateStableCurriculumPolicy`, and commits one result.
- **`GenerateStableCurriculumPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGenerateStableCurriculumRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GenerateStableCurriculumRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-07` | `L1-AAK-05` | The kit shall prescribe stable namespace inputs, normalization, collision handling, and regeneration behavior for package, system, course, lesson, objective, code-reference, and assessment identifiers. Human-readable titles shall not be the only identity source. |
| `L2-AAK-11` | `L1-AAK-08` | The workflow should produce a manifest containing tool and model identifiers/versions where available, kit and contract version, source snapshot, generation start/end timestamps, package checksum, declared options, and validation result. It shall exclude hidden chain-of-thought, credentials, and full prompt transcripts unless separately approved. |

## Diagrams

### System context

The curriculum authoring agent uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Approved source repositories only through the boundary
described by the requirements and approved configuration.

![C4 system context for generate stable curriculum](diagrams/c4-context.png)

### Containers

Authoring Kit CLI sends typed requests to Local Validator. The API applies
server-owned rules and records the accepted outcome in Authoring workspace.

![C4 container view for generate stable curriculum](diagrams/c4-container.png)

### Components

`GenerateStableCurriculumController` dispatches `GenerateStableCurriculumRequest` to `GenerateStableCurriculumHandler`. The handler
uses `GenerateStableCurriculumPolicy` and `IGenerateStableCurriculumRepository` before it commits a state change.

![C4 component view for generate stable curriculum](diagrams/c4-component.png)

### Class structure

`GenerateStableCurriculumHandler` depends on the request, policy, and repository abstractions.
`IGenerateStableCurriculumRepository` stores `GenerateStableCurriculumRecord` under tenant and version context.

![Class diagram for generate stable curriculum](diagrams/class-structure.png)

### Behaviour — deterministic identity procedure

The sequence applies `L2-AAK-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for deterministic identity procedure](diagrams/sequence-l2-aak-07.png)

### Behaviour — generation manifest

The sequence applies `L2-AAK-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for generation manifest](diagrams/sequence-l2-aak-11.png)
