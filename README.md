# RepoFluent

RepoFluent is an enterprise codebase learning platform that turns source code,
architecture documentation, operating knowledge, and training material into a
guided, measurable learning experience.

Organizations use an AI agent to prepare a portable curriculum package from
approved source material. RepoFluent validates and publishes that package as
courses, lessons, code tours, quizzes, and tests, while helping learners build
codebase fluency and giving managers visibility into progress and knowledge gaps.

> **Project status:** product definition and design exploration. The current
> checked-in baseline contains requirements, detailed designs, UI prototypes,
> and design-system foundations; it does not yet contain a production application.

## Product flow

1. An agent analyzes approved repositories and documentation.
2. The agent produces a versioned JSON curriculum package with source references.
3. RepoFluent validates the package and presents it for human review.
4. An approved version is published as an interactive learning experience.
5. Learners study systems alongside relevant code and demonstrate understanding.
6. Authorized managers review adoption, mastery, and knowledge gaps.

The product is guided by four central ideas: enterprise knowledge stays
controlled, lessons retain source provenance, learning and code navigation form
one experience, and humans approve agent-generated material before publication.

## Repository guide

| Path | Contents |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | Product vision, users, journeys, requirements, release scope, risks, and open decisions |
| [`docs/specs/`](docs/specs/) | L1 outcome requirements and traceable L2 acceptance requirements organized by subsystem |
| [`docs/detailed-designs/`](docs/detailed-designs/) | Requirement-traceable vertical feature designs with rendered C4, class, and sequence diagrams |
| [`docs/mocks/`](docs/mocks/) | Standalone interface concepts for learner, lesson, code-navigation, and analytics experiences |
| [`desigh-system/assets/`](desigh-system/assets/) | Shared CSS tokens, components, and documentation styles |

The [subsystem requirements index](docs/specs/README.md) explains requirement
ownership, identifier conventions, traceability, and the shared quality baseline.

## Explore the UI concepts

The prototype gallery and its concepts are plain HTML, CSS, and JavaScript. They
have no package dependencies or build step.

Open [`docs/mocks/index.html`](docs/mocks/index.html) directly in a browser, or
serve the repository locally:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000/docs/mocks/>. The gallery presents three current
directions using the same product domain so their interaction and visual choices
can be compared consistently:

- **Editorial Atlas** — a calm, publication-inspired learning environment.
- **Code Command** — a dense, keyboard-friendly developer workspace.
- **System Constellation** — a spatial interface organized around architecture.

## Working with the requirements

The [PRD](docs/PRD.md) is the product baseline. Subsystem specifications decompose
it into two levels:

- `L1.md` records stable, outcome-oriented requirements and boundaries.
- `L2.md` records testable requirements traced to L1 parents, with observable
  **GIVE / WHEN / THEN** acceptance scenarios.

When changing behavior or scope, update the PRD and affected specifications
together, preserve requirement identifiers where possible, and keep acceptance
criteria observable without weakening the source requirement.

All RepoFluent development shall follow PRD requirements `ENG-01` through
`ENG-03` and the normative
[Engineering handbook](https://github.com/QuinntyneBrown/engineering-handbook).
This obligation applies equally to human contributors and automated agents.

The [detailed-design index](docs/detailed-designs/README.md) maps each subsystem
to its vertical feature designs. Regenerate the tree after an approved
requirements or feature-slice change with:

```sh
python eng/generate_detailed_designs.py
python eng/verify_detailed_designs.py
```

Render all changed PlantUML sources with the renderer documented by the
`software-design-document` skill before handoff.

## Initial product scope

RepoFluent initially targets enterprise teams learning C# and Angular codebases.
The planned pilot includes tenant-aware access, curriculum validation and approval,
guided learning, source-linked code navigation, assessments, mastery tracking,
manager analytics, administration, accessibility, auditability, and operational
readiness.

The initial release is not intended to replace an IDE, modify customer source
code, automatically publish unreviewed content, or require WebGPU for core tasks.
