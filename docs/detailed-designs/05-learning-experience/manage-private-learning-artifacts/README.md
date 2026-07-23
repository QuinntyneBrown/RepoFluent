# Manage private learning artifacts

## Overview

RepoFluent's Learning Experience subsystem presents assigned curriculum, records durable progress, and preserves learning context. This feature
brings *private notes*, *bookmarks* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Learner application.
Learning API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ManagePrivateLearningArtifactsPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`LearningApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ManagePrivateLearningArtifactsController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ManagePrivateLearningArtifactsRequest`.
- **`ManagePrivateLearningArtifactsRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ManagePrivateLearningArtifactsHandler`** — application handler that loads authorized state,
  invokes `ManagePrivateLearningArtifactsPolicy`, and commits one result.
- **`ManagePrivateLearningArtifactsPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IManagePrivateLearningArtifactsRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ManagePrivateLearningArtifactsRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-LEX-12` | `L1-LEX-09` | Learners should create, edit, and delete notes anchored to an authorized curriculum version and optional lesson/block. Notes shall be visible only to their owner by default, excluded from manager analytics/content search, and handled by configured export/retention rules. |
| `L2-LEX-13` | `L1-LEX-09` | Learners should bookmark permitted courses, lessons, blocks, system nodes, and code references. A bookmark shall preserve version and context and shall report retired, removed, or newly inaccessible targets without leaking protected metadata. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Search service only through the boundary
described by the requirements and approved configuration.

![C4 system context for manage private learning artifacts](diagrams/c4-context.png)

### Containers

Learner application sends typed requests to Learning API. The API applies
server-owned rules and records the accepted outcome in Learning record store.

![C4 container view for manage private learning artifacts](diagrams/c4-container.png)

### Components

`ManagePrivateLearningArtifactsController` dispatches `ManagePrivateLearningArtifactsRequest` to `ManagePrivateLearningArtifactsHandler`. The handler
uses `ManagePrivateLearningArtifactsPolicy` and `IManagePrivateLearningArtifactsRepository` before it commits a state change.

![C4 component view for manage private learning artifacts](diagrams/c4-component.png)

### Class structure

`ManagePrivateLearningArtifactsHandler` depends on the request, policy, and repository abstractions.
`IManagePrivateLearningArtifactsRepository` stores `ManagePrivateLearningArtifactsRecord` under tenant and version context.

![Class diagram for manage private learning artifacts](diagrams/class-structure.png)

### Behaviour — private notes

The sequence applies `L2-LEX-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for private notes](diagrams/sequence-l2-lex-12.png)

### Behaviour — bookmarks

The sequence applies `L2-LEX-13` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for bookmarks](diagrams/sequence-l2-lex-13.png)
