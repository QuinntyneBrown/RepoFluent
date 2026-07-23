# ADR 0002: Development persona authentication

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

The first governed journey requires distinct Author, Reviewer, Administrator, and
Learner actors, while the pilot identity provider remains an open product decision.
Bypassing authorization would invalidate the workflow evidence.

## Decision

Provide four deterministic identities in Development, Testing, and E2E only. The
browser sends `X-RepoFluent-Dev-User` with a user identifier; the server resolves
the fixed tenant and role and never accepts tenant or role claims from the browser.
The UI displays a persistent non-production warning. The authentication handler
fails outside the explicitly allowed environments.

## Consequences

Role and tenant enforcement can be acceptance- and integration-tested now. This is
not production authentication and cannot be promoted. Selecting an enterprise
identity provider and session model requires a superseding ADR and threat-model
review.
