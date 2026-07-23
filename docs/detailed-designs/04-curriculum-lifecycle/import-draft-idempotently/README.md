# Import a draft idempotently

## Overview

RepoFluent converts a valid package into one complete tenant draft. The stable
package identity and semantic version remain portable contract values. A
separate opaque platform identifier addresses the tenant lifecycle record.

Intake extracts bounded identity fields from already screened JSON and checks
the tenant store before creating a receipt. Identical identity, version, and
checksum return the existing lifecycle result. Changed bytes under the same
identity and version return a stable conflict.

Validation claims record every attempt. An interrupted `Validating` record stays
retryable, and the next claim increments correlated attempt evidence. Draft
status, package metadata, issues, report, and audit event commit together.

## Description

The implemented vertical slice contains the following building blocks.

- **`CurriculumDraftImportPage`** — provides Page Object Model methods for
  receipt replay, identity separation, and cross-platform visual evidence.
- **`CurriculumPageComponent`** — presents stable package identity, semantic
  version, opaque platform draft, validation attempts, and replay state.
- **`ImportReceipt.IsReplay`** — distinguishes a new receipt from an existing
  lifecycle result without changing its identifier or checksum.
- **`PackageIntakeScanner.ReadIdentity`** — reads bounded package identity and
  version values from screened JSON.
- **`CurriculumWorkflow.ReceiveAsync`** — resolves tenant identity collisions,
  returns exact-checksum replays, and rejects changed bytes.
- **`CurriculumWorkflow.ValidateNextAsync`** — retries claimed work and commits
  one complete validation outcome.
- **`ICurriculumStore.GetImportByPackageIdentityAsync`** — defines the
  tenant-scoped identity lookup.
- **`CurriculumStore`** — enforces the filtered tenant, package, and version
  uniqueness index through SQLite.
- **`ConcurrentPackageIdentityException`** — converts a concurrent unique-index
  race into the same replay or conflict resolution.
- **`ValidationAttemptCount`** — records initial and retried validation claims
  on the lifecycle record.
- **`CurriculumDraftIdempotencyTests`** — proves replay convergence, changed-byte
  conflict, and recovery from interrupted conversion.

The current retained-record policy provides the idempotency window. Identical
replays continue to resolve while the lifecycle record remains present.

## Requirements

The feature realizes the following level-2 requirements. Each row cites the L1
parent named by the source requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-05` | `L1-CLI-01` | A package that passes import-blocking checks shall be converted into a draft transactionally. Stable package identifiers shall remain separate from platform tenant identifiers. Failed conversion shall not leave a resolvable partial draft and shall be safe to retry. |
| `L2-CLI-12` | `L1-CLI-09` | Re-upload of identical package identity, version, and checksum should return the existing receipt/draft result within the idempotency window. A reused identity/version with different bytes shall be treated as a conflict requiring a new version or explicit replacement workflow. |

### Implementation evidence

- `import-draft-idempotently.spec.ts` begins the slice with replay, conflict,
  identity, and visual acceptance through a Page Object.
- Two identical uploads return one identifier, one checksum, and
  `isReplay: true` on the second receipt.
- Changed bytes under the same package identity and version return
  `CLI_PACKAGE_VERSION_CONFLICT`.
- A filtered unique index prevents concurrent tenant duplicates when package
  identity and version are present.
- An interrupted conversion can claim the same record three times and finish
  as one complete draft with one validation report.
- Windows and Linux Chromium baselines capture the complete 280-pixel identity
  panel with RepoFluent design tokens.

## Diagrams

### System context

The curriculum author uploads a portable package. RepoFluent preserves its
stable identity while assigning one tenant-scoped platform draft.

![C4 system context for idempotent draft import](diagrams/c4-context.png)

### Containers

The Angular workspace displays replay state. The ASP.NET Core API and hosted
worker coordinate one lifecycle row in the SQLite curriculum store.

![C4 container view for idempotent draft import](diagrams/c4-container.png)

### Components

The workflow resolves identity through the store before receipt creation. The
worker retries `Validating` records and commits a complete draft outcome.

![C4 component view for idempotent draft import](diagrams/c4-component.png)

### Class structure

The receipt exposes replay state. The import record keeps portable identity,
opaque platform identity, checksum, status, and validation attempt count.

![Class diagram for idempotent draft import](diagrams/class-structure.png)

### Behaviour — atomic draft import

For `L2-CLI-05`, an interrupted validation claim retries the same lifecycle
record and commits either one complete draft or no draft.

![Sequence diagram for atomic draft import](diagrams/sequence-l2-cli-05.png)

### Behaviour — idempotent re-import

For `L2-CLI-12`, the checksum determines replay or conflict after tenant package
identity and version resolve to an existing record.

![Sequence diagram for idempotent re-import](diagrams/sequence-l2-cli-12.png)
