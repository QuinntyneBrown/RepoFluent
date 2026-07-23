# Publish an immutable version

## Overview

RepoFluent lets an authorized Administrator publish an approved, unchanged
curriculum draft. Publication atomically assigns an opaque version identity,
activates assignment availability, records audit evidence, and stores one
domain event.

The published record binds tenant, import, package identity, semantic version,
approved checksum, publisher, time, availability policy, and event identity.
The publication JSON is an EF concurrency token.

Duplicate and simultaneous commands converge on the stored version and event.
Corrected content uses a new draft and semantic version, while earlier
published content and assignments retain their originating version identity.

## Description

The implemented vertical slice contains the following building blocks.

- **`CurriculumPublicationPage`** — provides Page Object Model methods for
  approval, administration, publication evidence, and visual checks.
- **`CurriculumPageComponent`** — presents active availability, version
  identity, package checksum, publisher, safeguards, and publication event.
- **`CurriculumWorkflow.PublishAsync`** — requires Administrator permission and
  verifies the stored approval still matches package and validation checksums.
- **`Publication`** — captures version, tenant, import, package, checksum,
  availability, publisher, time, and event identity.
- **`CurriculumLifecycle.Publish`** — performs the approved-to-published
  transition and returns the existing identity after publication.
- **`CurriculumStore`** — commits lifecycle state, publication JSON, audit, and
  the domain event in one EF Core save.
- **`DomainEventEntity`** — stores the `curriculum.version-published` outbox
  event and serialized publication payload.
- **`ConcurrentPublicationException`** — converts a losing concurrency-token
  update into a reload of the winning publication.
- **`CurriculumPublicationTests`** — proves concurrent convergence, one audit,
  one event, corrected version publication, and version-one retention.

SQLite is the current foundation provider. The event row is a durable outbox
record for a future production publication projector.

## Requirements

The feature realizes the following level-2 requirements. Each row cites the L1
parent named by the source requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CLI-08` | `L1-CLI-05` | Only an authorized Administrator shall publish an approved, unchanged version. Publication shall atomically assign the immutable published version identity, activate its availability policy, and emit audit and domain events. Duplicate or concurrent publication commands shall converge on one result. |
| `L2-CLI-09` | `L1-CLI-06` | Published content, source snapshot, assessment definitions, and protected answer policies shall be read-only. Corrections shall produce a new draft and published version. Learning progress, attempts, mastery evidence, and audit records shall retain the originating version identifiers. |

### Implementation evidence

- `publish-immutable-version.spec.ts` starts the slice with Administrator
  publication and a dedicated Page Object.
- Publication requires an immutable Approved decision whose package and issue
  checksums still match the lifecycle record.
- `PublicationJson` is an EF concurrency token. Simultaneous commands return
  the same version ID and event ID.
- One concurrent publication produces one `curriculum.published` audit and one
  `curriculum.version-published` domain event.
- The publication and outbox event commit through one `SaveChangesAsync`
  transaction.
- Published records expose `ActiveForAssignment` without allowing package
  mutation through any lifecycle route.
- A corrected `2.0.0` package publishes as a separate version. Version `1.0.0`
  assignments and lesson content remain queryable by their original ID.
- Windows and Linux Chromium baselines capture the token-conformant publication
  evidence card.

## Diagrams

### System context

An Administrator publishes approved curriculum through RepoFluent. Learners
continue using assignments bound to immutable published version identities.

![C4 system context for immutable publication](diagrams/c4-context.png)

### Containers

The Angular workspace presents publication evidence. The ASP.NET Core API
commits lifecycle, audit, and outbox state in the SQLite store.

![C4 container view for immutable publication](diagrams/c4-container.png)

### Components

The workflow validates unchanged approval, transitions the lifecycle, and saves
one `Publication` through the concurrency-protected store.

![C4 component view for immutable publication](diagrams/c4-component.png)

### Class structure

`Publication` binds immutable package and availability evidence.
`DomainEventEntity` stores the corresponding publication outbox event.

![Class diagram for immutable publication](diagrams/class-structure.png)

### Behaviour — controlled publication

For `L2-CLI-08`, simultaneous Administrator commands converge through the
publication concurrency token and return one stored result.

![Sequence diagram for controlled publication](diagrams/sequence-l2-cli-08.png)

### Behaviour — published immutability

For `L2-CLI-09`, corrected content creates version two while version-one
assignments and learning reads continue resolving their original content.

![Sequence diagram for published immutability](diagrams/sequence-l2-cli-09.png)
