# Define safe content and code

## Overview

RepoFluent's Curriculum Input Contract subsystem defines the portable curriculum package, its compatibility rules, and its conformance artifacts. This feature
brings *content block vocabulary*, *code references and tours* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The contract maintainer starts the outcome through Contract workbench.
Contract Registry API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`DefineSafeContentAndCodeWorkbench`** — .NET tool entry component that presents
  the feature state and submits a typed intent.
- **`ContractRegistryClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`DefineSafeContentAndCodeController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `DefineSafeContentAndCodeRequest`.
- **`DefineSafeContentAndCodeRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`DefineSafeContentAndCodeHandler`** — application handler that loads authorized state,
  invokes `DefineSafeContentAndCodePolicy`, and commits one result.
- **`DefineSafeContentAndCodePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IDefineSafeContentAndCodeRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`DefineSafeContentAndCodeRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-04` | `L1-CIC-02` | The schema shall use a discriminated, allow-listed content-block model for structured prose, callouts, diagrams or accessible system maps, code references, code tours, examples, glossary links, and knowledge checks. Arbitrary active HTML, script, executable content, macro content, and undeclared remote resources shall be invalid. |
| `L2-CIC-05` | `L1-CIC-09` | Code references shall require repository-relative paths and shall support repository identifier, optional commit, symbol, line/range anchors, language, supplied excerpt, content classification, and explanatory provenance. Code tours shall contain an ordered list of resolvable references with learner guidance at each step. |

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for define safe content and code](diagrams/c4-context.png)

### Containers

Contract workbench sends typed requests to Contract Registry API. The API applies
server-owned rules and records the accepted outcome in Contract artifact store.

![C4 container view for define safe content and code](diagrams/c4-container.png)

### Components

`DefineSafeContentAndCodeController` dispatches `DefineSafeContentAndCodeRequest` to `DefineSafeContentAndCodeHandler`. The handler
uses `DefineSafeContentAndCodePolicy` and `IDefineSafeContentAndCodeRepository` before it commits a state change.

![C4 component view for define safe content and code](diagrams/c4-component.png)

### Class structure

`DefineSafeContentAndCodeHandler` depends on the request, policy, and repository abstractions.
`IDefineSafeContentAndCodeRepository` stores `DefineSafeContentAndCodeRecord` under tenant and version context.

![Class diagram for define safe content and code](diagrams/class-structure.png)

### Behaviour — content block vocabulary

The sequence applies `L2-CIC-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for content block vocabulary](diagrams/sequence-l2-cic-04.png)

### Behaviour — code references and tours

The sequence applies `L2-CIC-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for code references and tours](diagrams/sequence-l2-cic-05.png)
