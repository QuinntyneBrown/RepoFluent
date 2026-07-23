# Configure tenant branding

## Overview

RepoFluent's Administration and Tenant Operations subsystem coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications. This feature
brings *tenant branding* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Administration application.
Administration API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`ConfigureTenantBrandingPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`AdministrationApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`ConfigureTenantBrandingController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `ConfigureTenantBrandingRequest`.
- **`ConfigureTenantBrandingRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`ConfigureTenantBrandingHandler`** — application handler that loads authorized state,
  invokes `ConfigureTenantBrandingPolicy`, and commits one result.
- **`ConfigureTenantBrandingPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IConfigureTenantBrandingRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`ConfigureTenantBrandingRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ATO-11` | `L1-ATO-05` | Branding should support tenant display name, approved logo asset, constrained color tokens, and approved sign-in message. Inputs shall be sanitized and validated for file/type/size, contrast, focus visibility, legibility, and reserved product/security messaging. Invalid branding shall not publish. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Notification provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for configure tenant branding](diagrams/c4-context.png)

### Containers

Administration application sends typed requests to Administration API. The API applies
server-owned rules and records the accepted outcome in Tenant operations store.

![C4 container view for configure tenant branding](diagrams/c4-container.png)

### Components

`ConfigureTenantBrandingController` dispatches `ConfigureTenantBrandingRequest` to `ConfigureTenantBrandingHandler`. The handler
uses `ConfigureTenantBrandingPolicy` and `IConfigureTenantBrandingRepository` before it commits a state change.

![C4 component view for configure tenant branding](diagrams/c4-component.png)

### Class structure

`ConfigureTenantBrandingHandler` depends on the request, policy, and repository abstractions.
`IConfigureTenantBrandingRepository` stores `ConfigureTenantBrandingRecord` under tenant and version context.

![Class diagram for configure tenant branding](diagrams/class-structure.png)

### Behaviour — tenant branding

The sequence applies `L2-ATO-11` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for tenant branding](diagrams/sequence-l2-ato-11.png)
