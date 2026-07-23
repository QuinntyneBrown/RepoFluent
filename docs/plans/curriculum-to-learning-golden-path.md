# Curriculum-to-Learning Golden Path

## Outcome

Prove that a source-linked JSON curriculum can pass through separate Author,
Reviewer, Administrator, and Learner responsibilities and become an assigned,
rendered lesson using durable state and the same draft/published renderer.

## Delivered slices

1. Persist an authorized upload receipt and validate contract `0.1.0`
   asynchronously with stable issue codes and JSON Pointer paths.
2. Preview and approve the exact draft checksum, publish it immutably, and create
   one direct learner assignment.
3. Present assigned learning, ordered course/module/lesson structure, objectives,
   prose, callouts, and repository-relative code references.
4. Retain layered unit, SQLite integration, Angular component, and live-stack
   Playwright evidence.

## Explicit non-goals

Production identity/database selection, group assignment, progress synchronization,
assessments, code tours, system maps, warnings acknowledgement, retirement,
notifications, production deployment, and full Curriculum Input Contract
conformance remain deferred.

## ATDD evidence

Commit `774a6a5` contains the runnable failing acceptance test. It confirmed API
health and the application shell, then failed on the missing Curriculum imports
outcome. The implementation commit preserves the same acceptance behavior,
refactors browser mechanics into Page Objects, and makes the live journey green.
