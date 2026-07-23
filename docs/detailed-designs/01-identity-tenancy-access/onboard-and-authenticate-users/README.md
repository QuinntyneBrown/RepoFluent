# Onboard and authenticate users

## Overview

RepoFluent's Identity, Tenancy, and Access subsystem establishes tenant identity, authentication, authorization, groups, sessions, and access evidence. This feature
brings *local invitation lifecycle*, *enterprise single sign-on* into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The tenant administrator starts the outcome through Identity administration.
RepoFluent Identity API applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`OnboardAndAuthenticateUsersPage`** — Angular 21 entry component that presents
  the feature state and submits a typed intent.
- **`IdentityAccessApiClient`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`OnboardAndAuthenticateUsersController`** — ASP.NET Core boundary that authenticates
  the caller, applies endpoint policy, and dispatches `OnboardAndAuthenticateUsersRequest`.
- **`OnboardAndAuthenticateUsersRequest`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`OnboardAndAuthenticateUsersHandler`** — application handler that loads authorized state,
  invokes `OnboardAndAuthenticateUsersPolicy`, and commits one result.
- **`OnboardAndAuthenticateUsersPolicy`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`IOnboardAndAuthenticateUsersRepository`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`OnboardAndAuthenticateUsersRecord`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-ITA-02` | `L1-ITA-02` | An authorized administrator shall be able to issue a single-tenant, single-use invitation with an expiry. Acceptance shall verify the intended identity, require supported credential controls, activate the membership once, and invalidate the invitation. Expired, revoked, reused, or tenant-mismatched invitations shall fail safely. |
| `L2-ITA-03` | `L1-ITA-02` | The production authentication path shall validate identity-provider signatures, issuer, audience, lifetime, replay protections, and tenant routing before establishing a RepoFluent session. Claims-to-user and claims-to-group mappings shall use an administrator-approved configuration and shall not grant unsupported roles implicitly. |

## Diagrams

### System context

The tenant administrator uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Enterprise identity provider only through the boundary
described by the requirements and approved configuration.

![C4 system context for onboard and authenticate users](diagrams/c4-context.png)

### Containers

Identity administration sends typed requests to RepoFluent Identity API. The API applies
server-owned rules and records the accepted outcome in Identity and access store.

![C4 container view for onboard and authenticate users](diagrams/c4-container.png)

### Components

`OnboardAndAuthenticateUsersController` dispatches `OnboardAndAuthenticateUsersRequest` to `OnboardAndAuthenticateUsersHandler`. The handler
uses `OnboardAndAuthenticateUsersPolicy` and `IOnboardAndAuthenticateUsersRepository` before it commits a state change.

![C4 component view for onboard and authenticate users](diagrams/c4-component.png)

### Class structure

`OnboardAndAuthenticateUsersHandler` depends on the request, policy, and repository abstractions.
`IOnboardAndAuthenticateUsersRepository` stores `OnboardAndAuthenticateUsersRecord` under tenant and version context.

![Class diagram for onboard and authenticate users](diagrams/class-structure.png)

### Behaviour — local invitation lifecycle

The sequence applies `L2-ITA-02` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for local invitation lifecycle](diagrams/sequence-l2-ita-02.png)

### Behaviour — enterprise single sign-on

The sequence applies `L2-ITA-03` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for enterprise single sign-on](diagrams/sequence-l2-ita-03.png)
