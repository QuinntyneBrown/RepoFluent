# Search and navigate learning

## Overview

RepoFluent's Learning Experience subsystem presents assigned curriculum, records durable progress, and preserves learning context. This feature
brings *search scope and result model*, *structured navigation and context preservation*, *contextual glossary* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Learner application.
Learning API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`SearchAndNavigateLearningPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`LearningApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`SearchAndNavigateLearningController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `SearchAndNavigateLearningRequest`.
- **`SearchAndNavigateLearningRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`SearchAndNavigateLearningHandler`** — application handler that loads authorized state,
  invokes `SearchAndNavigateLearningPolicy`, and commits one result.
- **`SearchAndNavigateLearningPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`ISearchAndNavigateLearningRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`SearchAndNavigateLearningRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-LEX-07` | `L1-LEX-04` | Search shall index and return only permitted published systems, subsystems, courses, lessons, glossary terms, and code-reference metadata. Results shall identify type, curriculum/version, context snippet, and target. Authorization changes and retirement shall remove discoverability within the documented propagation target. |
| `L2-LEX-08` | `L1-LEX-04` | Breadcrumbs, course outline, back navigation, drawers, and split views shall preserve the originating curriculum, lesson, position, and selected relationship/code reference. Deep links shall reestablish authorized context or provide a safe recovery route when it is no longer available. |
| `L2-LEX-09` | `L1-LEX-06` | An identified glossary term shall expose its definition, aliases, owning curriculum/version, and related entities in an accessible popover, drawer, or inline expansion. Opening/closing the definition shall preserve reading position and keyboard focus. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Search service only through the boundary
described by the requirements and approved configuration.

![C4 system context for search and navigate learning](diagrams/c4-context.png)

### Containers

Learner application sends typed requests to Learning API. The API applies
server-owned rules and records the accepted outcome in Learning record store.

![C4 container view for search and navigate learning](diagrams/c4-container.png)

### Components

`SearchAndNavigateLearningController` dispatches `SearchAndNavigateLearningRequest` to `SearchAndNavigateLearningHandler`. The handler
uses `SearchAndNavigateLearningPolicy` and `ISearchAndNavigateLearningRepository` before it commits a state change.

![C4 component view for search and navigate learning](diagrams/c4-component.png)

### Class structure

`SearchAndNavigateLearningHandler` depends on the request, policy, and repository abstractions.
`ISearchAndNavigateLearningRepository` stores `SearchAndNavigateLearningRecord` under tenant and version context.

![Class diagram for search and navigate learning](diagrams/class-structure.png)

### Behaviour — search scope and result model

The sequence applies `L2-LEX-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for search scope and result model](diagrams/sequence-l2-lex-07.png)

### Behaviour — structured navigation and context preservation

The sequence applies `L2-LEX-08` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for structured navigation and context preservation](diagrams/sequence-l2-lex-08.png)

### Behaviour — contextual glossary

The sequence applies `L2-LEX-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for contextual glossary](diagrams/sequence-l2-lex-09.png)
