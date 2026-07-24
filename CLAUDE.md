# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

RepoFluent is an enterprise codebase-learning platform: an AI agent produces a versioned JSON curriculum package, RepoFluent validates it, humans review/approve it, and an approved version is published as courses, lessons, code tours, and assessments. `AGENTS.md` contains binding repository guidelines — follow them.

Required tool versions: .NET SDK `10.0.101` (pinned in `global.json`), Node.js 22, npm `10.9.4`.

## Commands

Backend (from repo root):

```powershell
dotnet restore backend/RepoFluent.sln
dotnet build backend/RepoFluent.sln --no-restore        # warnings are errors
dotnet test backend/RepoFluent.sln --no-build
dotnet test backend/RepoFluent.sln --filter "FullyQualifiedName~TestName"   # single test
dotnet run --project backend/src/RepoFluent.Api/RepoFluent.Api.csproj       # API; SQLite migrations auto-run in Development/E2E
```

Frontend (from `frontend/`):

```powershell
npm ci
npm start                                  # serves repofluent-app on :4200, expects the API running
npm run build                              # builds repofluent-app + api + components libraries
npm test                                   # Vitest unit tests for all three projects
npx ng test repofluent-app --watch=false   # unit tests for one project (also: api, components)
npm run format:check                       # Prettier (the frontend formatter)
npm run design:check                       # design-system consumer contract
npm run e2e                                # Playwright acceptance tests (self-contained, see below)
npx playwright test e2e/publish-immutable-version.spec.ts --project=chromium   # single e2e spec
```

Release/design verification (CI runs all of these):

```powershell
node eng/verify_contract_releases.mjs
node eng/verify_authoring_kits.mjs
python eng/verify_high_level_designs.py
python eng/verify_detailed_designs.py
```

`npm run e2e` needs no servers started manually: `playwright.config.ts` launches the API on `127.0.0.1:5080` with `ASPNETCORE_ENVIRONMENT=E2E` and a disposable SQLite database, plus a production-configuration Angular build on `127.0.0.1:4217`. Chromium runs every spec; Firefox/WebKit run only `browser-capability.spec.ts`.

## Architecture

### Backend — `backend/src/`, layered .NET 10

- `RepoFluent.Domain` — deliberately tiny: the `CurriculumLifecycle` state machine (`CurriculumStatus` transitions such as draft → reviewed → published → retired) and its exceptions.
- `RepoFluent.Application` — the curriculum model (Package, Course, Lesson, Assessment, code tours, source citations…), `CurriculumWorkflow` orchestration, `PackageValidator`/`PackageIntakeScanner`/`PackageVersionComparer`, view models, and the ports `ICurriculumStore` and `IUserDirectory`. Concurrency conflicts surface as typed `Concurrent*Exception`s.
- `RepoFluent.Infrastructure` — EF Core + SQLite implementation (`CurriculumStore`, `RepoFluentDbContext`, entities, migrations) and `DevelopmentUserDirectory`.
- `RepoFluent.Api` — minimal-API endpoint classes (`CurriculumEndpoints`, `ContractEndpoints`, `AuthoringKitEndpoints`), the `CurriculumValidationWorker` background service (validation is asynchronous — upload returns a receipt, a worker produces the draft), and `DevelopmentAuthenticationHandler` providing the Author/Reviewer/Administrator/Learner test personas (enabled only in Development, Testing, and E2E environments). OpenAPI at `/openapi/v1.json`, health at `/api/health`.

Tests: `backend/tests/RepoFluent.Domain.Tests` and `RepoFluent.Api.IntegrationTests` (xUnit, `*Tests.cs`).

### Frontend — `frontend/`, Angular 21 workspace

Three projects: `projects/repofluent-app` (the application), `projects/api` (shared API models/client library), `projects/components` (shared UI library). TypeScript is strict; unit tests are Vitest `*.spec.ts`.

Playwright acceptance tests live in `frontend/e2e/`, one spec per user-facing capability, with all flows expressed through Page Objects in `frontend/e2e/pages/` so specs stay business-focused. Visual snapshots are committed per platform — intentional visual changes must update snapshots for both Windows and Linux.

### Versioned release artifacts

`contracts/curriculum/<version>/` (curriculum JSON schema + fixtures) and `authoring-kit/releases/<version>/` (checksummed offline authoring kits) are immutable once released — never edit released content; publish a new version instead. The `eng/verify_*` scripts enforce this and validate checksums/structure.

### Docs traceability

`docs/PRD.md` → `docs/specs/<subsystem>/L1.md` (outcome requirements, `L1-<subsystem>-NN`) → `L2.md` (testable requirements with GIVE/WHEN/THEN acceptance criteria, `L2-<subsystem>-NN`) → `docs/high-level-designs/` and `docs/detailed-designs/`. When behavior or scope changes, update the PRD/specs and regenerate design indexes (`eng/generate_*.py`). `desigh-system/` is intentionally spelled that way.

## Code style rules (enforced — see AGENTS.md)

- One named type per source file (classes, records, interfaces, enums, delegates, TS type aliases — including nested types); no partial types; file named after the type. Declaration-free barrel files may re-export.
- Every Angular component uses three adjacent files with the same basename (`.ts`, `.html`, `.scss`) referenced via `templateUrl`/`styleUrl`; inline `template`/`styles` metadata is prohibited even when empty.
- C#: 4-space indent, PascalCase, analyzers with warnings-as-errors. TypeScript: 2-space indent, kebab-case filenames, Prettier.
- Commits follow Conventional Commits with scopes, e.g. `feat(curriculum): publish immutable versions`.
