# Analyze .NET and Angular

## Overview

The acquired RepoFluent authoring kit provides source-grounded analysis profiles
for representative C# and Angular repositories. Each profile defines eleven
structural evidence categories and requires repository-relative paths with
stable locators.

The C# profile covers solution structure, boundaries, composition, endpoints,
domain services, persistence, messaging, configuration, workers, clients, and
tests. Dynamic assembly registration remains an explicit unresolved behavior
when the supplied snapshot cannot determine runtime contributions.

The Angular profile covers bootstrap, routes, components or modules, services,
injection, state, HTTP, guards and interceptors, templates, configuration, and
tests. Its user-to-API trace contains five source-supported steps.

## Description

The implemented vertical slice contains the following building blocks.

- **C# analysis guide** — defines eleven categories, citation requirements,
  inert inspection rules, corroborating test use, and dynamic-behavior
  reporting.
- **Angular analysis guide** — defines eleven categories, a source-supported
  user-flow procedure, and boundaries around build-time or absent behavior.
- **Representative C# fixture** — supplies a solution, web composition,
  controller, domain service, repository, publisher, client, worker, test, and
  intentionally dynamic registration.
- **Representative Angular fixture** — supplies standalone bootstrap, routes,
  component, template, store, service, HTTP configuration, guard, interceptor,
  environment, and test.
- **Analysis reports** — map every category to a local path and locator, retain
  C# uncertainty, and map the Angular flow from route to API.
- **`verify-ecosystem-analysis.mjs`** — validates profile coverage, confines
  repository paths, resolves cited files, preserves unresolved behavior, and
  emits a safe summary.
- **`build_authoring_kit.mjs` and `verify_authoring_kits.mjs`** — hash the
  guides, reports, fixture snapshots, and verifier, then execute both profiles
  without network access.
- **`AuthoringEcosystemPolicyComponent`** — presents both profile contracts,
  evidence gates, dynamic uncertainty, and local commands with design tokens.
- **`AuthoringEcosystemPage`** — provides the Playwright Page Object for profile
  outcomes, absent-source rejection, accessible content, and visual evidence.

The verifier reads reports and fixture bytes as inert local data. It does not
restore packages, compile projects, execute source, or contact an API.

## Requirements

The feature realizes the following level-2 requirements. Each row cites the L1
parent named by the source requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-AAK-09` | `L1-AAK-07` | C# guidance should cover solution/project structure, application boundaries, dependency injection, controllers/endpoints, domain services, persistence, messaging, configuration, background workers, external clients, and tests. It shall tell the agent to report dynamic or unresolved behavior rather than infer it as fact. |
| `L2-AAK-10` | `L1-AAK-07` | Angular guidance should cover application bootstrap, route boundaries, standalone components or modules, services, dependency injection, state flow, HTTP integration, guards/interceptors, templates, configuration, and tests. |

### Implementation evidence

- `analyze-dotnet-and-angular.spec.ts` begins the slice with Page Object
  acceptance for both eleven-category profiles.
- The C# report cites ten supplied files and retains one
  `AAK_DYNAMIC_BEHAVIOR_UNRESOLVED` finding.
- The Angular report cites five ordered user-to-API steps across route,
  component, state, service, and HTTP evidence.
- A source-absent flow step emits `AAK_ANALYSIS_SOURCE_MISSING` at its evidence
  path.
- Windows and Linux Chromium baselines capture the complete 560-pixel profile
  panel.

## Diagrams

### System context

The curriculum-authoring agent applies acquired profiles to approved C# and
Angular snapshots. Every accepted analysis claim resolves to local source.

![C4 system context for ecosystem analysis](diagrams/c4-context.png)

### Containers

The Angular view communicates the profile contract. The Node.js verifier reads
reports, guides, and fixture snapshots from the acquired release.

![C4 container view for ecosystem analysis](diagrams/c4-container.png)

### Components

The verifier coordinates profile selection, category coverage, path
confinement, source resolution, unresolved behavior, flow validation, and safe
summary projection.

![C4 component view for ecosystem analysis](diagrams/c4-component.png)

### Class structure

An analysis report owns one profile, eleven category entries, optional
unresolved behaviors, and profile-specific flow steps. Each entry contains one
source reference.

![Class diagram for ecosystem analysis](diagrams/class-structure.png)

### Behaviour — C# analysis guidance

For `L2-AAK-09`, the verifier confirms eleven categories and supplied source
while retaining the unresolved dynamic registration.

![Sequence diagram for C# analysis guidance](diagrams/sequence-l2-aak-09.png)

### Behaviour — Angular analysis guidance

For `L2-AAK-10`, the verifier confirms eleven categories and resolves every
user-to-API step to the supplied Angular snapshot.

![Sequence diagram for Angular analysis guidance](diagrams/sequence-l2-aak-10.png)
