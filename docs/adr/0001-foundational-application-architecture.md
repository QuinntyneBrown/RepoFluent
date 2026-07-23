# ADR 0001: Foundational application architecture

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

The curriculum lifecycle contains authorization-sensitive workflow gates,
immutable publication, asynchronous validation, and learner projections. The
repository previously had no executable application or persistence decision.

## Decision

Use the handbook's layered .NET architecture: Domain, Application,
Infrastructure, and API. Keep state transitions in Domain/Application and use EF
Core behind an Application-owned store. Use SQLite for the local vertical slice,
with a checked-in forward migration. Use Angular 21 as an application shell with
source-level `api` and `components` libraries, consuming the existing Code Command
design tokens.

## Consequences

The workflow is testable without HTTP and provider behavior is covered using real
SQLite integration tests. SQLite is not a production database selection. A future
provider decision must add an ADR and migration/operational strategy. The existing
`desigh-system` directory name remains unchanged to avoid an unrelated migration.
