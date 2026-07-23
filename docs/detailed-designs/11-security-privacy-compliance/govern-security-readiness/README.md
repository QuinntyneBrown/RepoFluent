# Govern security readiness

## Overview

RepoFluent's Security, Privacy, and Compliance subsystem protects customer data and establishes security, privacy, retention, and release controls. This feature
brings *threat model and privacy review*, *vulnerability and dependency management* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The security administrator starts the outcome through Security administration.
Security Control API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`GovernSecurityReadinessPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`SecurityApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`GovernSecurityReadinessController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `GovernSecurityReadinessRequest`.
- **`GovernSecurityReadinessRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`GovernSecurityReadinessHandler`** — application handler that loads authorized state,
  invokes `GovernSecurityReadinessPolicy`, and commits one result.
- **`GovernSecurityReadinessPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IGovernSecurityReadinessRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`GovernSecurityReadinessRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-SPC-15` | `L1-SPC-10` | Before production customer code is processed, an approved threat model and privacy review shall cover trust boundaries, tenants, identity, agent/package supply chain, uploads, rendering, answer protection, analytics privacy, integrations, operational access, retention/deletion, abuse cases, and mitigations. Material design changes shall trigger review. |
| `L2-SPC-16` | `L1-SPC-10` | Build/release processes shall inventory dependencies, scan code/artifacts/configuration, verify provenance where supported, triage findings by policy, patch within severity targets, and prevent release for prohibited unresolved findings. Security testing shall include the launch-critical authorization and content-safety paths. |

## Diagrams

### System context

The security administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Key and secret management service only through the boundary
described by the requirements and approved configuration.

![C4 system context for govern security readiness](diagrams/c4-context.png)

### Containers

Security administration sends typed requests to Security Control API. The API applies
server-owned rules and records the accepted outcome in Security evidence store.

![C4 container view for govern security readiness](diagrams/c4-container.png)

### Components

`GovernSecurityReadinessController` dispatches `GovernSecurityReadinessRequest` to `GovernSecurityReadinessHandler`. The handler
uses `GovernSecurityReadinessPolicy` and `IGovernSecurityReadinessRepository` before it commits a state change.

![C4 component view for govern security readiness](diagrams/c4-component.png)

### Class structure

`GovernSecurityReadinessHandler` depends on the request, policy, and repository abstractions.
`IGovernSecurityReadinessRepository` stores `GovernSecurityReadinessRecord` under tenant and version context.

![Class diagram for govern security readiness](diagrams/class-structure.png)

### Behaviour — threat model and privacy review

The sequence applies `L2-SPC-15` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for threat model and privacy review](diagrams/sequence-l2-spc-15.png)

### Behaviour — vulnerability and dependency management

The sequence applies `L2-SPC-16` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for vulnerability and dependency management](diagrams/sequence-l2-spc-16.png)
