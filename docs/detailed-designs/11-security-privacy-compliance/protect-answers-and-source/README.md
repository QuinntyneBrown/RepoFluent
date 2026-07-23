# Protect answers and source

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *answer-key separation*, *source minimization*, *classification propagation* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ProtectAnswersAndSourcePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ProtectAnswersAndSourceController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ProtectAnswersAndSourceRequest`.
- **`ProtectAnswersAndSourceRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ProtectAnswersAndSourceHandler`** — application handler that loads authorized state,
  invokes `ProtectAnswersAndSourcePolicy`, and commits one result.
- **`ProtectAnswersAndSourcePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IProtectAnswersAndSourceRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ProtectAnswersAndSourceRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-09` | `L1-SPC-05` | Protected answers, grading matchers, and unreleased rationales shall use separate authorization/data transfer models and shall be excluded from learner payloads, static bundles, general search, browser caches where controllable, CDN/public caches, logs, and analytics event properties. |
| `L2-SPC-10` | `L1-SPC-06` | Packages and imports shall contain/store only approved excerpts or metadata needed for objectives, explanations, tours, and references. Excerpt length/count and classifications shall be enforceable. When a link/metadata is sufficient, workflows should avoid duplicating whole source files or repositories. |
| `L2-SPC-11` | `L1-SPC-06` | Supported content classification/redaction metadata shall propagate from package/source through draft, published content, excerpts, search, analytics, export, cache, logs, backup, and deletion workflows. Derived data shall not receive a less restrictive classification without explicit approved transformation. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for protect answers and source](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for protect answers and source](diagrams/c4-container.png)

### Components

`ProtectAnswersAndSourceController` dispatches `ProtectAnswersAndSourceRequest` to `ProtectAnswersAndSourceHandler`. The handler
uses `ProtectAnswersAndSourcePolicy` and `IProtectAnswersAndSourceRepository` before it commits a state change.

![C4 component view for protect answers and source](diagrams/c4-component.png)

### Class structure

`ProtectAnswersAndSourceHandler` depends on the request, policy, and repository abstractions.
`IProtectAnswersAndSourceRepository` stores `ProtectAnswersAndSourceRecord` under tenant and version context.

![Class diagram for protect answers and source](diagrams/class-structure.png)

### Behaviour — answer-key separation

The sequence applies `L2-SPC-09` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for answer-key separation](diagrams/sequence-l2-spc-09.png)

### Behaviour — source minimization

The sequence applies `L2-SPC-10` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for source minimization](diagrams/sequence-l2-spc-10.png)

### Behaviour — classification propagation

The sequence applies `L2-SPC-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for classification propagation](diagrams/sequence-l2-spc-11.png)
