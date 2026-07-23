# Render and resolve code

## Overview

RepoFluent's Codebase Navigation subsystem connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships. This feature
brings *safe excerpt rendering*, *reference identity and resolution*, *access re-evaluation*, *non-execution and non-modification boundary* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The learner starts the outcome through Code navigator.
Code Navigation API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`RenderAndResolveCodePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CodeNavigationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`RenderAndResolveCodeController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `RenderAndResolveCodeRequest`.
- **`RenderAndResolveCodeRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`RenderAndResolveCodeHandler`** — application handler that loads authorized state,
  invokes `RenderAndResolveCodePolicy`, and commits one result.
- **`RenderAndResolveCodePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IRenderAndResolveCodeRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`RenderAndResolveCodeRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CBN-01` | `L1-CBN-01` | The renderer shall display supplied C# and Angular-family excerpts as inert text with language-appropriate syntax highlighting, preserved line numbers/ranges, wrapping or horizontal scrolling, copy policy, and accessible text semantics. It shall never interpret excerpt markup or execute source. |
| `L2-CBN-02` | `L1-CBN-02` | A code reference shall resolve by tenant, curriculum/version, declared repository, repository-relative path, optional revision, symbol, and line/range. Resolution shall validate all anchors, normalize paths without traversal, and return a safe unavailable state for missing or invalid targets. |
| `L2-CBN-07` | `L1-CBN-05` | Authorization shall be re-evaluated when resolving an excerpt, tour step, file/symbol node, provider link, search result, or relationship. Previously saved progress or bookmarks shall not confer content access. Unauthorized references shall not expose path, symbol, excerpt, relationship, or existence beyond safe messaging. |
| `L2-CBN-12` | `L1-CBN-09` | The subsystem shall expose no source edit, commit, execution, build, deployment, or write-provider operation. Relationship statements not present in approved package/provider metadata shall be labeled as unavailable rather than inferred. |

## Diagrams

### System context

The learner uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Repository provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for render and resolve code](diagrams/c4-context.png)

### Containers

Code navigator sends typed requests to Code Navigation API. The API applies
server-owned rules and records the accepted outcome in Code metadata store.

![C4 container view for render and resolve code](diagrams/c4-container.png)

### Components

`RenderAndResolveCodeController` dispatches `RenderAndResolveCodeRequest` to `RenderAndResolveCodeHandler`. The handler
uses `RenderAndResolveCodePolicy` and `IRenderAndResolveCodeRepository` before it commits a state change.

![C4 component view for render and resolve code](diagrams/c4-component.png)

### Class structure

`RenderAndResolveCodeHandler` depends on the request, policy, and repository abstractions.
`IRenderAndResolveCodeRepository` stores `RenderAndResolveCodeRecord` under tenant and version context.

![Class diagram for render and resolve code](diagrams/class-structure.png)

### Behaviour — safe excerpt rendering

The sequence applies `L2-CBN-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for safe excerpt rendering](diagrams/sequence-l2-cbn-01.png)

### Behaviour — reference identity and resolution

The sequence applies `L2-CBN-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for reference identity and resolution](diagrams/sequence-l2-cbn-02.png)

### Behaviour — access re-evaluation

The sequence applies `L2-CBN-07` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for access re-evaluation](diagrams/sequence-l2-cbn-07.png)

### Behaviour — non-execution and non-modification boundary

The sequence applies `L2-CBN-12` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for non-execution and non-modification boundary](diagrams/sequence-l2-cbn-12.png)
