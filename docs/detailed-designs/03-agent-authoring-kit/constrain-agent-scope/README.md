# Constrain agent scope

## Overview

RepoFluent's Agent Authoring Kit subsystem guides approved agents from declared source scope to a locally validated curriculum package. This feature
brings *repository instruction precedence*, *scope and access declaration*, *secret and sensitive-data handling* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum authoring agent starts the outcome through Authoring Kit CLI.
Local Validator applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ConstrainAgentScopeCli`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`AuthoringKitClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ConstrainAgentScopeController`** — .NET boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ConstrainAgentScopeRequest`.
- **`ConstrainAgentScopeRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ConstrainAgentScopeHandler`** — application handler that loads authorized state,
  invokes `ConstrainAgentScopePolicy`, and commits one result.
- **`ConstrainAgentScopePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IConstrainAgentScopeRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ConstrainAgentScopeRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-02` | `L1-AAK-02` | `AGENTS.md` shall instruct the agent to discover and obey applicable repository guidance, resolve scope by directory, preserve explicit exclusions, and stop or report conflict rather than silently overriding higher-priority customer instructions. |
| `L2-AAK-03` | `L1-AAK-02` | The workflow shall require an explicit source scope, approved repositories/documents, revision or snapshot, exclusions, output location, and data-handling constraints before analysis. The kit shall not instruct an agent to elevate access, bypass controls, or retrieve undeclared sources. |
| `L2-AAK-04` | `L1-AAK-02` | Instructions shall require agents to avoid collecting secrets, minimize source excerpts, honor content classification/redaction metadata, and stop/report suspected secret exposure. The validation workflow shall support secret-pattern scanning before package release. |

## Diagrams

### System context

The curriculum authoring agent uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Approved source repositories only through the boundary
described by the requirements and approved configuration.

![C4 system context for constrain agent scope](diagrams/c4-context.png)

### Containers

Authoring Kit CLI sends typed requests to Local Validator. The API applies
server-owned rules and records the accepted outcome in Authoring workspace.

![C4 container view for constrain agent scope](diagrams/c4-container.png)

### Components

`ConstrainAgentScopeController` dispatches `ConstrainAgentScopeRequest` to `ConstrainAgentScopeHandler`. The handler
uses `ConstrainAgentScopePolicy` and `IConstrainAgentScopeRepository` before it commits a state change.

![C4 component view for constrain agent scope](diagrams/c4-component.png)

### Class structure

`ConstrainAgentScopeHandler` depends on the request, policy, and repository abstractions.
`IConstrainAgentScopeRepository` stores `ConstrainAgentScopeRecord` under tenant and version context.

![Class diagram for constrain agent scope](diagrams/class-structure.png)

### Behaviour — repository instruction precedence

The sequence applies `L2-AAK-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for repository instruction precedence](diagrams/sequence-l2-aak-02.png)

### Behaviour — scope and access declaration

The sequence applies `L2-AAK-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for scope and access declaration](diagrams/sequence-l2-aak-03.png)

### Behaviour — secret and sensitive-data handling

The sequence applies `L2-AAK-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for secret and sensitive-data handling](diagrams/sequence-l2-aak-04.png)
