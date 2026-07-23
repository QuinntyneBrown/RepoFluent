# Define safe content and code

## Overview

RepoFluent's Curriculum Input Contract defines a closed lesson-block vocabulary
and revision-bound code evidence in the same portable package. The slice keeps
structured prose, callouts, accessible diagrams, code references, ordered code
tours, examples, glossary definitions, and knowledge checks inert by contract.

Authors exercise the contract through the existing curriculum upload and
preview journey. The API applies schema-independent semantic safety rules before
creating a draft, and the learner renderer uses only design-system tokens and
semantic HTML to present accepted blocks.

## Description

The implemented vertical slice uses these building blocks:

- **`curriculum.schema.json`** — JSON Schema discriminator union for all eight
  allow-listed blocks and the complete code-tour step contract.
- **`Block` and `CodeTourStep`** — typed application records that preserve
  accessible metadata, repository identity, optional branch and commit, line
  anchors, excerpt classification, guidance, and provenance.
- **`PackageValidator`** — server-owned allow-list, active-content and remote
  resource rejection, repository-relative path checks, snapshot binding,
  ordered-tour validation, and typed glossary and assessment references.
- **`LessonRendererComponent`** — token-only Angular presentation using semantic
  figures, complementary callouts, ordered lists, definitions, regions, and
  escaped source excerpts.
- **`SafeContentAndCodePage`** — Playwright Page Object that drives the
  live-stack author preview and exact-path blocking-safety scenarios.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-CIC-04` | `L1-CIC-02` | The schema shall use a discriminated, allow-listed content-block model for structured prose, callouts, diagrams or accessible system maps, code references, code tours, examples, glossary links, and knowledge checks. Arbitrary active HTML, script, executable content, macro content, and undeclared remote resources shall be invalid. |
| `L2-CIC-05` | `L1-CIC-09` | Code references shall require repository-relative paths and shall support repository identifier, optional commit, symbol, line/range anchors, language, supplied excerpt, content classification, and explanatory provenance. Code tours shall contain an ordered list of resolvable references with learner guidance at each step. |

### Implementation evidence

- `SafeContentAndCodeTests` executes the complete discriminator set and proves
  non-disclosing `CIC_ACTIVE_CONTENT` and `CIC_UNDECLARED_RESOURCE` issues at
  exact JSON Pointer paths.
- The release conformance catalog replaces the representative lesson blocks
  with the full safe vocabulary and runs them through `PackageValidator`.
- `safe-content-and-code.spec.ts` uploads the package as an author, previews the
  learner rendering, inspects revision-bound source context, verifies ordered
  Angular and C# tour steps, and captures the token-conformant visual contract.
- The contract release verifier binds the updated schema, ICD, validation
  catalog, fixtures, and release notes into one regenerated SHA-256 checksum.

## Diagrams

### System context

The contract maintainer uses RepoFluent to complete the feature outcome.
RepoFluent interacts with Artifact distribution service only through the boundary
described by the requirements and approved configuration.

![C4 system context for define safe content and code](diagrams/c4-context.png)

### Containers

Contract workbench sends typed requests to Contract Registry API. The API applies
server-owned rules and records the accepted outcome in Contract artifact store.

![C4 container view for define safe content and code](diagrams/c4-container.png)

### Components

`DefineSafeContentAndCodeController` dispatches `DefineSafeContentAndCodeRequest` to `DefineSafeContentAndCodeHandler`. The handler
uses `DefineSafeContentAndCodePolicy` and `IDefineSafeContentAndCodeRepository` before it commits a state change.

![C4 component view for define safe content and code](diagrams/c4-component.png)

### Class structure

`DefineSafeContentAndCodeHandler` depends on the request, policy, and repository abstractions.
`IDefineSafeContentAndCodeRepository` stores `DefineSafeContentAndCodeRecord` under tenant and version context.

![Class diagram for define safe content and code](diagrams/class-structure.png)

### Behaviour — content block vocabulary

The sequence applies `L2-CIC-04` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for content block vocabulary](diagrams/sequence-l2-cic-04.png)

### Behaviour — code references and tours

The sequence applies `L2-CIC-05` before the handler persists an accepted result. A rejected policy or validation result returns without a state change.

![Sequence diagram for code references and tours](diagrams/sequence-l2-cic-05.png)
