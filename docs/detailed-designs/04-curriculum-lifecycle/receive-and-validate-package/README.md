# Receive and validate a package

## Overview

RepoFluent's Curriculum Lifecycle subsystem moves curriculum packages through intake, validation, draft, review, publication, comparison, and retirement. This feature
brings *authorized upload intake*, *intake rejection*, *validation orchestration*, *validation severity and acknowledgement* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The curriculum operator starts the outcome through Curriculum administration.
Curriculum Lifecycle API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ReceiveAndValidatePackagePage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`CurriculumLifecycleApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ReceiveAndValidatePackageController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ReceiveAndValidatePackageRequest`.
- **`ReceiveAndValidatePackageRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ReceiveAndValidatePackageHandler`** — application handler that loads authorized state,
  invokes `ReceiveAndValidatePackagePolicy`, and commits one result.
- **`ReceiveAndValidatePackagePolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IReceiveAndValidatePackageRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ReceiveAndValidatePackageRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-01` | `L1-CLI-01` | Only an authorized Author or stronger explicit grant shall initiate upload for a tenant. Intake shall enforce media type and configured byte limits, compute a checksum, scan for malformed/unsafe content, assign an opaque platform identifier, and persist a tenant-scoped receipt before asynchronous processing. |
| `L2-CLI-02` | `L1-CLI-01` | Unsupported types, limit violations, malformed archives, executable payloads, and failed security scans shall be rejected before import. Rejection shall not create learner-visible or partially imported entities and shall provide a safe actionable result to the author. |
| `L2-CLI-03` | `L1-CLI-02` | Validation shall execute the supported contract checks for version, schema, identifiers, references, ordering, content types, source references, provenance, assessment integrity, security restrictions, and configured limits. The validation result shall identify validator and contract versions and package checksum. |
| `L2-CLI-04` | `L1-CLI-03` | Errors shall block draft preview or publication according to the validation stage. Warnings shall require an authorized acknowledgement with actor, time, issue set/checksum, and optional rationale before approval. A changed issue set shall invalidate prior warning acknowledgement. |

## Diagrams

### System context

The curriculum operator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Content scanning service only through the boundary
described by the requirements and approved configuration.

![C4 system context for receive and validate a package](diagrams/c4-context.png)

### Containers

Curriculum administration sends typed requests to Curriculum Lifecycle API. The API applies
server-owned rules and records the accepted outcome in Curriculum store.

![C4 container view for receive and validate a package](diagrams/c4-container.png)

### Components

`ReceiveAndValidatePackageController` dispatches `ReceiveAndValidatePackageRequest` to `ReceiveAndValidatePackageHandler`. The handler
uses `ReceiveAndValidatePackagePolicy` and `IReceiveAndValidatePackageRepository` before it commits a state change.

![C4 component view for receive and validate a package](diagrams/c4-component.png)

### Class structure

`ReceiveAndValidatePackageHandler` depends on the request, policy, and repository abstractions.
`IReceiveAndValidatePackageRepository` stores `ReceiveAndValidatePackageRecord` under tenant and version context.

![Class diagram for receive and validate a package](diagrams/class-structure.png)

### Behaviour — authorized upload intake

The sequence applies `L2-CLI-01` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for authorized upload intake](diagrams/sequence-l2-cli-01.png)

### Behaviour — intake rejection

The sequence applies `L2-CLI-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for intake rejection](diagrams/sequence-l2-cli-02.png)

### Behaviour — validation orchestration

The sequence applies `L2-CLI-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for validation orchestration](diagrams/sequence-l2-cli-03.png)

### Behaviour — validation severity and acknowledgement

The sequence applies `L2-CLI-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for validation severity and acknowledgement](diagrams/sequence-l2-cli-04.png)
