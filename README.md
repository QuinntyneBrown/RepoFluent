# RepoFluent

RepoFluent is an enterprise codebase learning platform that turns source code,
architecture documentation, operating knowledge, and training material into a
guided, measurable learning experience.

Organizations use an AI agent to prepare a portable curriculum package from
approved source material. RepoFluent validates and publishes that package as
courses, lessons, code tours, quizzes, and tests, while helping learners build
codebase fluency and giving managers visibility into progress and knowledge gaps.

> **Project status:** foundational vertical slice. The repository contains an
> acceptance-tested curriculum-to-learning journey alongside the requirements,
> designs, prototypes, and design-system foundations. Development personas and
> SQLite are local/test choices; the product is not production-ready.

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

| Path                                                   | Contents                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| [`backend/`](backend/)                                 | .NET 10 domain, application, SQLite infrastructure, API, migrations, and tests                                                   |
| [`frontend/`](frontend/)                               | Angular 21 application shell, API/components libraries, unit tests, and Playwright journey                                       |
| [`contracts/`](contracts/)                             | Versioned curriculum schema, contract notes, and conformance fixtures                                                            |
| [`docs/PRD.md`](docs/PRD.md)                           | Product vision, users, journeys, requirements, release scope, risks, and open decisions                                          |
| [`docs/specs/`](docs/specs/)                           | L1 outcome requirements and traceable L2 acceptance requirements organized by subsystem                                          |
| [`docs/high-level-designs/`](docs/high-level-designs/) | Platform and subsystem target architecture with rendered context, container, component, class, deployment, and sequence diagrams |
| [`docs/detailed-designs/`](docs/detailed-designs/)     | Requirement-traceable vertical feature designs with rendered C4, class, and sequence diagrams                                    |
| [`docs/mocks/`](docs/mocks/)                           | Standalone interface concepts for learner, lesson, code-navigation, and analytics experiences                                    |
| [`desigh-system/assets/`](desigh-system/assets/)       | Shared CSS tokens, components, and documentation styles                                                                          |

The [subsystem requirements index](docs/specs/README.md) explains requirement
ownership, identifier conventions, traceability, and the shared quality baseline.

## Run the vertical slice

Prerequisites are .NET SDK `10.0.101`, Node.js 22, and npm `10.9.4`. Restore the
local EF tool and start the API from the repository root:

```powershell
dotnet tool restore
dotnet run --project backend/src/RepoFluent.Api/RepoFluent.Api.csproj
```

In a second terminal, start Angular:

```powershell
Set-Location frontend
npm ci
npm start
```

Open <http://localhost:4200>. The persistent banner and persona selector expose
the Author, Reviewer, Administrator, and Learner test identities. They are enabled
only in Development, Testing, and E2E environments. Upload
`contracts/curriculum/0.1.0/fixtures/order-processing.json`, then move through
review, publication, assignment, and learning.

SQLite migrations run automatically for Development/E2E startup. Production
deployment must use an explicit migration step after a production database and
identity design are approved.

## Build and test

```powershell
dotnet restore backend/RepoFluent.sln
dotnet build backend/RepoFluent.sln --no-restore
dotnet test backend/RepoFluent.sln --no-build

Set-Location frontend
npm ci
npm run format:check
npm run build
npm test
npm run e2e
```

The Playwright command starts an isolated E2E API on port `5080`, an Angular app
on port `4217`, and a disposable SQLite database. Its role-oriented journey uses
Page Objects under `frontend/e2e/pages` so the acceptance specification remains
focused on business behavior. The contract and public endpoint shapes are
documented in [`contracts/curriculum/0.1.0/`](contracts/curriculum/0.1.0/), and
development OpenAPI is exposed at `/openapi/v1.json`.

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
