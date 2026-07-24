# Operate and audit the lifecycle

## Overview

RepoFluent exposes the operational state and immutable evidence of each
curriculum import. An *active stage* is the lifecycle gate currently holding a
package. A *completed stage* is a gate recorded before the current state. A
*stale validation* is a `Validating` import whose processing start exceeds the
5-minute lease.

Authors and Administrators receive timestamps, safe recovery details, and the
support correlation that links intake, worker, and audit activity. A stale
validation becomes actionable, but recovery returns the import to `Received`.
The worker claims it again and repeats validation before the package can return
to Draft.

Auditors retrieve a tenant-scoped ordered history for one import. Each entry
identifies its actor or system, action, package version, package checksum,
lifecycle state, timestamp, and correlation. Upload, intake scan, validation,
draft import, warning acknowledgement, review, publication, comparison access,
retry, and retirement use the same durable audit stream.

## Description

The implemented vertical slice contains the following building blocks.

- **`CurriculumLifecycleOperationsPage`** — Playwright Page Object Model that
  drives two packages through publication, comparison, and retirement before
  checking Auditor evidence and Windows or Linux visual baselines.
- **`CurriculumPageComponent`** — Angular page that presents
  `LifecycleProgress`, exposes authorized retry and history actions, and renders
  the ordered evidence with design-system panels, statuses, cards, callouts,
  and tables.
- **`RepoFluentApiService`** — typed Angular client for
  `GET /api/curriculum-imports/{id}/history` and
  `POST /api/curriculum-imports/{id}/retry-validation`.
- **`CurriculumEndpoints`** — ASP.NET Core boundary that authenticates the
  caller and delegates status, retry, and history requests.
- **`CurriculumWorkflow`** — applies role and tenant policy, detects a stale
  validation against `StaleValidationThreshold`, returns
  `LifecycleProgress`, and coordinates safe retry through the domain lifecycle.
- **`CurriculumLifecycle.RecoverValidation`** — permits only the
  `Validating`-to-`Received` recovery transition. Review, approval, and
  publication gates remain unreachable until validation completes again.
- **`LifecycleProgress`** — carries the active and completed stages, lifecycle
  timestamps, action-required state, stable failure code, and safe recovery
  detail.
- **`LifecycleHistory`** and **`LifecycleAuditEntry`** — carry package evidence
  and the ordered audit rows returned to an authorized Auditor, Author, or
  Administrator.
- **`ICurriculumStore`** and **`CurriculumStore`** — claim only `Received`
  work, increment each validation attempt, write state and audit evidence in
  one EF Core save, and query audit rows by tenant and import identity.
- **`AuditEventEntity`** — persists actor, action, target, correlation,
  occurrence time, package checksum, package version, and lifecycle state in
  SQLite.
- **`CurriculumLifecycleOperationsTests`** — proves stale detection, explicit
  authorization, a single resumed draft, repeated validation, ordered evidence,
  Auditor access, and tenant isolation.

`PackageIntakeScanner` reads safe JSON and package identity before the store
records `curriculum.uploaded` and `curriculum.scan-completed`. The validation
worker records `curriculum.validation-started` or
`curriculum.validation-retried`, then commits
`curriculum.validation-completed` and `curriculum.draft-imported` together.
Later workflow commands add acknowledgement, decision, publication,
comparison-access, and retirement evidence against the same import target.

## Requirements

The feature realizes the following level-2 requirements. Each row cites the L1
parent named by the source requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-13` | `L1-CLI-11` | Authors and administrators shall see current state, completed/active stage, timestamps, actionable safe failure details, and support correlation identifier. Stale processing jobs shall be detected. Authorized retry shall resume from a safe stage without bypassing validation or approval. |
| `L2-CLI-14` | `L1-CLI-11` | Upload, scan, validation, acknowledgement, draft import, review, approval/rejection, publication, retry, retirement, and version-comparison access shall produce tenant-scoped audit or operational evidence appropriate to sensitivity. |

### Implementation evidence

- `operate-and-audit-lifecycle.spec.ts` starts the slice with the
  `CurriculumLifecycleOperationsPage` Page Object Model and exercises the real
  Angular, API, worker, domain, EF Core, and SQLite path.
- A second automatic claim cannot reclaim an interrupted `Validating` import.
  The status marks a lease older than 5 minutes with
  `CLI_VALIDATION_STALE`, a safe detail, and the authorized `retry` action.
- Authorized retry records `curriculum.retry-requested`, returns the import to
  `Received`, and lets the worker record a second validation attempt. The
  resulting state is Draft, so approval and publication remain gated.
- The history query filters by tenant and import identity and orders by the
  append-only audit identifier.
- The retirement acceptance path contains upload, scan, validation, draft
  import, warning acknowledgement, approval, publication, comparison access,
  and retirement entries with actors, states, versions, checksums, timestamps,
  and correlations.
- Chromium baselines capture operational and audit evidence with the existing
  design-system visual language.

## Diagrams

### System context

Authors and Administrators monitor and recover curriculum processing. Auditors
inspect retained lifecycle evidence through RepoFluent.

![C4 system context for operating and auditing the lifecycle](diagrams/c4-context.png)

### Containers

The Angular application calls the ASP.NET Core API. The API applies lifecycle
policy and stores tenant-scoped imports and audit rows in SQLite.

![C4 container view for operating and auditing the lifecycle](diagrams/c4-container.png)

### Components

The page uses the typed API client and endpoint boundary. `CurriculumWorkflow`
coordinates `CurriculumLifecycle` and `ICurriculumStore`, while
`CurriculumStore` commits state and evidence.

![C4 component view for operating and auditing the lifecycle](diagrams/c4-component.png)

### Class structure

`ImportStatus` owns `LifecycleProgress`; `LifecycleHistory` owns ordered
`LifecycleAuditEntry` values. The workflow depends on the lifecycle state
machine and store abstraction.

![Class diagram for operating and auditing the lifecycle](diagrams/class-structure.png)

### Behaviour — lifecycle status and recovery

For `L2-CLI-13`, status evaluation detects an expired validation lease.
Authorized retry returns only to `Received`, and the worker repeats validation
before producing one Draft.

![Sequence diagram for lifecycle status and recovery](diagrams/sequence-l2-cli-13.png)

### Behaviour — lifecycle audit trail

For `L2-CLI-14`, lifecycle commands append tenant-scoped evidence. The Auditor
then retrieves the import and its audit rows in immutable order.

![Sequence diagram for lifecycle audit trail](diagrams/sequence-l2-cli-14.png)
