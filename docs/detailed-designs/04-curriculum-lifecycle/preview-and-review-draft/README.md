# Preview and review a draft

## Overview

RepoFluent's Curriculum Lifecycle subsystem moves curriculum packages through intake, validation, draft, review, publication, comparison, and retirement. This feature
brings *learner-equivalent preview*, *review decision* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum operator starts the outcome through Curriculum administration.
Curriculum Lifecycle API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`PreviewAndReviewDraftPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CurriculumLifecycleApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`PreviewAndReviewDraftController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `PreviewAndReviewDraftRequest`.
- **`PreviewAndReviewDraftRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`PreviewAndReviewDraftHandler`** — application handler that loads authorized state,
  invokes `PreviewAndReviewDraftPolicy`, and commits one result.
- **`PreviewAndReviewDraftPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IPreviewAndReviewDraftRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`PreviewAndReviewDraftRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-06` | `L1-CLI-04` | Preview shall use the same renderer, sanitization, access policy, answer protection, responsive behavior, and fallback behavior as publication, while clearly marking draft/version context. Preview access shall be restricted to authorized review participants and shall not create learner progress or assessment evidence. |
| `L2-CLI-07` | `L1-CLI-05` | An authorized Reviewer shall approve or reject a specific content checksum and validation report. The decision shall capture reviewer, tenant, version candidate, decision, time, warning acknowledgement, and comment/rationale where required. An author shall not self-approve unless separately granted Reviewer permission by policy. |

## Diagrams

### System context

The curriculum operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Content scanning service only through the boundary
described by the requirements and approved configuration.

![C4 system context for preview and review a draft](diagrams/c4-context.png)

### Containers

Curriculum administration sends typed requests to Curriculum Lifecycle API. The API applies
server-owned rules and records the accepted outcome in Curriculum store.

![C4 container view for preview and review a draft](diagrams/c4-container.png)

### Components

`PreviewAndReviewDraftController` dispatches `PreviewAndReviewDraftRequest` to `PreviewAndReviewDraftHandler`. The handler
uses `PreviewAndReviewDraftPolicy` and `IPreviewAndReviewDraftRepository` before it commits a state change.

![C4 component view for preview and review a draft](diagrams/c4-component.png)

### Class structure

`PreviewAndReviewDraftHandler` depends on the request, policy, and repository abstractions.
`IPreviewAndReviewDraftRepository` stores `PreviewAndReviewDraftRecord` under tenant and version context.

![Class diagram for preview and review a draft](diagrams/class-structure.png)

### Behaviour — learner-equivalent preview

The sequence applies `L2-CLI-06` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for learner-equivalent preview](diagrams/sequence-l2-cli-06.png)

### Behaviour — review decision

The sequence applies `L2-CLI-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for review decision](diagrams/sequence-l2-cli-07.png)
