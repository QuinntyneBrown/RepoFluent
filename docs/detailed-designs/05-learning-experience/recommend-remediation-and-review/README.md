# Recommend remediation and review

## Overview

RepoFluent's Learning Experience subsystem presents assigned curriculum, records durable progress, and preserves learning context. This feature
brings *remediation recommendation*, *spaced review* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Learner application.
Learning API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RecommendRemediationAndReviewPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`LearningApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RecommendRemediationAndReviewController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RecommendRemediationAndReviewRequest`.
- **`RecommendRemediationAndReviewRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RecommendRemediationAndReviewHandler`** — application handler that loads authorized state,
  invokes `RecommendRemediationAndReviewPolicy`, and commits one result.
- **`RecommendRemediationAndReviewPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRecommendRemediationAndReviewRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RecommendRemediationAndReviewRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-LEX-10` | `L1-LEX-07` | After an incorrect formative answer or low objective-level result, the experience shall recommend permitted published lessons/sections mapped to the affected objective. Recommendations shall not reveal protected answers and shall distinguish required remediation from optional review. |
| `L2-LEX-14` | `L1-LEX-10` | Spaced review should use documented recency, performance, mastery, prior reviews, and tenant settings. It shall identify the objective and reason, permit deferral within policy, avoid duplicate concurrent review assignments, and recalculate after new evidence. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Search service only through the boundary
described by the requirements and approved configuration.

![C4 system context for recommend remediation and review](diagrams/c4-context.png)

### Containers

Learner application sends typed requests to Learning API. The API applies
server-owned rules and records the accepted outcome in Learning record store.

![C4 container view for recommend remediation and review](diagrams/c4-container.png)

### Components

`RecommendRemediationAndReviewController` dispatches `RecommendRemediationAndReviewRequest` to `RecommendRemediationAndReviewHandler`. The handler
uses `RecommendRemediationAndReviewPolicy` and `IRecommendRemediationAndReviewRepository` before it commits a state change.

![C4 component view for recommend remediation and review](diagrams/c4-component.png)

### Class structure

`RecommendRemediationAndReviewHandler` depends on the request, policy, and repository abstractions.
`IRecommendRemediationAndReviewRepository` stores `RecommendRemediationAndReviewRecord` under tenant and version context.

![Class diagram for recommend remediation and review](diagrams/class-structure.png)

### Behaviour — remediation recommendation

The sequence applies `L2-LEX-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for remediation recommendation](diagrams/sequence-l2-lex-10.png)

### Behaviour — spaced review

The sequence applies `L2-LEX-14` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for spaced review](diagrams/sequence-l2-lex-14.png)
