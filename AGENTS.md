# Repository Guidelines

## Project Structure & Module Organization

- `backend/src/` contains the .NET 10 Domain, Application, Infrastructure, and API projects; tests are in `backend/tests/`.
- `frontend/projects/` contains the Angular app plus API and component libraries; unit and Playwright tests are colocated or under `frontend/e2e/`.
- `contracts/` and `authoring-kit/` hold versioned schemas, fixtures, and offline releases. Treat released artifacts as immutable.
- Requirements and designs live in `docs/`; static design-system documentation is in the intentionally named `desigh-system/`.

## Build, Test, and Development Commands

```powershell
dotnet restore backend/RepoFluent.sln
dotnet build backend/RepoFluent.sln --no-restore
dotnet test backend/RepoFluent.sln --no-build
dotnet run --project backend/src/RepoFluent.Api/RepoFluent.Api.csproj
node eng/verify_authoring_kits.mjs
```

In `frontend/`, run `npm ci`, then `npm start`, `npm run build`, `npm test`, `npm run format:check`, or `npm run e2e`. E2E starts isolated API and Angular servers. Use .NET SDK 10.0.101, Node.js 22, and npm 10.9.4.

## Coding Style & Naming Conventions

.NET enforces recommended analyzers, code style, and warnings-as-errors. Use four-space C# indentation and PascalCase names. TypeScript is strict; use two spaces, kebab-case Angular filenames, and Prettier.

### Mandatory Source-File Layout

- These rules cover committed frontend and backend production, test, and generated code.
- Every named type—class, record, struct, interface, enum, delegate, or TypeScript type alias—must have one correctly named source file.
- Do not declare multiple named types in one file, including nested types, or split a type across files with partial declarations.
- Use namespaces, modules, and imports instead of container classes. Declaration-free barrels may re-export individually declared types.

### Angular Components

- Every component requires adjacent `.ts`, `.html`, and `.scss` files sharing a basename, such as `lesson-page.component.*`.
- Reference them with `templateUrl` and `styleUrl`/`styleUrls`; inline templates and styles are prohibited, even when empty.

## Testing Guidelines

xUnit files follow `*Tests.cs`; Vitest and Playwright files use `*.spec.ts`. Keep E2E flows in Page Objects and update intentional Windows and Linux snapshots. Before finishing, check changed files for multiple types, verify each changed component’s three files, and run affected builds and tests.

## Commit & Pull Request Guidelines

Use scoped Conventional Commits, for example `feat(curriculum): publish immutable versions`. PRs should describe behavior and requirement impact, link issues, list validation, and include UI screenshots. Update the PRD, specifications, and design indexes when scope changes.
