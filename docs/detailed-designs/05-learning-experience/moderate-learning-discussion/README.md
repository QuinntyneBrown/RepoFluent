# Moderate learning discussion

## Overview

RepoFluent's Learning Experience subsystem presents assigned curriculum, records durable progress, and preserves learning context. This feature
brings *discussion and expert q&a guardrail* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Learner application.
Learning API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ModerateLearningDiscussionPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`LearningApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ModerateLearningDiscussionController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ModerateLearningDiscussionRequest`.
- **`ModerateLearningDiscussionRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ModerateLearningDiscussionHandler`** — application handler that loads authorized state,
  invokes `ModerateLearningDiscussionPolicy`, and commits one result.
- **`ModerateLearningDiscussionPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IModerateLearningDiscussionRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ModerateLearningDiscussionRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-LEX-15` | `L1-LEX-11` | If enabled, content discussion shall be tenant-controlled, restricted to approved cohorts/content, moderated, auditable, classified as user-generated content, and unable to expose protected answers or inaccessible source material. Private notes shall never be converted to discussion without explicit learner action. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Search service only through the boundary
described by the requirements and approved configuration.

![C4 system context for moderate learning discussion](diagrams/c4-context.png)

### Containers

Learner application sends typed requests to Learning API. The API applies
server-owned rules and records the accepted outcome in Learning record store.

![C4 container view for moderate learning discussion](diagrams/c4-container.png)

### Components

`ModerateLearningDiscussionController` dispatches `ModerateLearningDiscussionRequest` to `ModerateLearningDiscussionHandler`. The handler
uses `ModerateLearningDiscussionPolicy` and `IModerateLearningDiscussionRepository` before it commits a state change.

![C4 component view for moderate learning discussion](diagrams/c4-component.png)

### Class structure

`ModerateLearningDiscussionHandler` depends on the request, policy, and repository abstractions.
`IModerateLearningDiscussionRepository` stores `ModerateLearningDiscussionRecord` under tenant and version context.

![Class diagram for moderate learning discussion](diagrams/class-structure.png)

### Behaviour — discussion and expert q&a guardrail

The sequence applies `L2-LEX-15` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for discussion and expert q&a guardrail](diagrams/sequence-l2-lex-15.png)
