# RepoFluent Subsystem Requirements

## Document control

| Field                 | Value                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- |
| Product               | RepoFluent                                                                            |
| Requirements baseline | `docs/PRD.md`, version 0.1, 2026-07-22                                                |
| Specification status  | Draft for engineering and stakeholder review                                          |
| Requirement language  | **Shall** is mandatory, **should** is planned but deferrable, and **may** is optional |

## Purpose

This directory decomposes the RepoFluent product requirements into subsystem-owned specifications. Every subsystem contains:

- `L1.md`: stable, outcome-oriented subsystem requirements and boundaries.
- `L2.md`: testable detailed requirements, each traced to an L1 requirement and supplied with acceptance criteria.

The acceptance criteria retain the requested **GIVE / WHEN / THEN** labels. `GIVE` is the precondition (the conventional “Given” clause), `WHEN` is the triggering action or event, and `THEN` is the observable result.

## Subsystem map

| Subsystem                         | Responsibility                                                                                              | Primary PRD source     |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------- |
| `01-identity-tenancy-access`      | Tenant isolation, authentication, authorization, teams, and access audit                                    | IAM-01–IAM-07          |
| `02-curriculum-input-contract`    | Portable curriculum package contract, ICD, schema, fixtures, compatibility, and safety limits               | PRD 8.3, CUR-01–CUR-04 |
| `03-agent-authoring-kit`          | Versioned agent guidance, generation workflow, local validation, and manifests                              | AGT-01–AGT-08          |
| `04-curriculum-lifecycle`         | Upload, validation orchestration, draft, preview, review, approval, publication, versioning, and retirement | CUR-01–CUR-12          |
| `05-learning-experience`          | Learner home, course delivery, progress, search, glossary, recommendations, notes, and review               | LRN-01–LRN-11          |
| `06-codebase-navigation`          | Source excerpts, code references, code tours, file/symbol navigation, and architecture relationships        | CODE-01–CODE-08        |
| `07-assessment-mastery`           | Quizzes, tests, grading, attempt evidence, answer protection, and explainable mastery                       | ASM-01–ASM-09          |
| `08-analytics-reporting`          | Learner and manager analytics, privacy-safe drill-down, gaps, comparisons, and export                       | ANL-01–ANL-09          |
| `09-administration-operations`    | Users, groups, assignments, settings, processing status, retention, branding, and notifications             | ADM-01–ADM-06          |
| `10-experience-platform`          | Design system, responsive interaction, accessibility, progressive visual enhancement, and performance       | PRD 9, pilot AC-8/9    |
| `11-security-privacy-compliance`  | Data protection, content safety, secrets, audit integrity, retention controls, and tenant boundaries        | PRD 4/11/17            |
| `12-observability-supportability` | Telemetry, correlation, monitoring, diagnostics, reliability, backup/restore, and incident readiness        | PRD 12, ADM-04         |

## Traceability rules

1. L1 identifiers are unique and use `L1-<subsystem>-NN`.
2. L2 identifiers are unique and use `L2-<subsystem>-NN`.
3. Every L2 requirement names exactly one primary L1 parent and may name supporting L1 or PRD requirements.
4. Every L2 requirement has at least one observable acceptance scenario using GIVE / WHEN / THEN.
5. PRD priorities remain authoritative. A decomposition may add testable detail but shall not weaken a PRD requirement.
6. Open product decisions in PRD section 18 remain unresolved unless a requirement explicitly defines a safe default needed for the pilot.

## Shared quality baseline

All development and all subsystems shall conform to PRD ENG-01–ENG-03 and the normative [Engineering handbook](https://github.com/QuinntyneBrown/engineering-handbook). They shall also preserve tenant isolation, role-based access, immutable published curriculum evidence, WCAG 2.2 AA behavior for launch-critical flows, safe failure behavior, structured telemetry without sensitive payloads, and the learner-shell performance budgets defined in the PRD. Cross-cutting controls are specified once in their owning subsystem and referenced rather than redefined inconsistently.

## Executable scenario coverage

This table records bounded scenario evidence, not blanket implementation of an
entire L2 requirement. Requirements remain draft until all of their acceptance and
production-readiness conditions are satisfied.

| Scenario                                                                               | Requirement coverage                          | Evidence                                               | Status                                 |
| -------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| Valid JSON upload creates a tenant receipt and asynchronous draft                      | L2-CLI-01, L2-CLI-05; supporting L2-CIC-02–05 | SQLite API integration test and Playwright golden path | Implemented scenario                   |
| Intake rejects executable-shaped bytes and binds eleven-category evidence to exact warning acknowledgement | L2-CLI-01–04 | API acceptance tests and Playwright POM visual | Implemented scenarios |
| Identical package replay converges on one draft while changed bytes conflict and interrupted conversion retries | L2-CLI-05, L2-CLI-12 | SQLite integration tests and Playwright POM visual | Implemented scenarios |
| Forbidden source path is blocked with stable code and exact JSON Pointer               | L2-CIC-05, L2-CIC-10; supporting L2-CLI-03    | `CurriculumGoldenPathApiTests`                         | Implemented scenario                   |
| Complete package preserves source, architecture, learning, and protected assessment shape | L2-CIC-02, L2-CIC-03, L2-CIC-06            | API tests and Playwright contract POM visual           | Implemented scenarios                  |
| Safe lesson vocabulary and revision-bound Angular/C# tours reject active or remote content | L2-CIC-04, L2-CIC-05                        | API tests, release conformance, and Playwright POM visual | Implemented scenarios                  |
| Evidence resolves to source snapshots while identities and primitives remain canonical     | L2-CIC-07, L2-CIC-08, L2-CIC-09            | API tests, JSON Schema, ICD, and Playwright POM visual    | Implemented scenarios                  |
| Namespaced extensions preserve core meaning and block unsupported critical semantics        | L2-CIC-13                                   | API tests, JSON Schema, ICD, and Playwright POM visual    | Implemented scenarios                  |
| Versioned contract release verifies artifacts, compatibility, migrations, and fixtures | L2-CIC-01, L2-CIC-12, L2-CIC-14               | Release verifier, API tests, and Playwright POM visual | Implemented scenarios                  |
| Acquired authoring kit verifies its artifacts and validates examples without network access | L2-AAK-01, L2-AAK-12                        | Kit verifier, API test, and Playwright POM visual         | Implemented scenarios                  |
| Root-to-directory guidance, declared sources, and redacted secret findings gate analysis     | L2-AAK-02, L2-AAK-03, L2-AAK-04             | Offline preflight verifier and Playwright POM visual       | Implemented scenarios                  |
| Snapshot citations classify claims while material conflicts remain reviewer-visible          | L2-AAK-05, L2-AAK-06                         | Offline evidence verifier and Playwright POM visual        | Implemented scenarios                  |
| Prose-only regeneration preserves identities and emits a safe checksummed run manifest        | L2-AAK-07, L2-AAK-11                         | Offline generation verifier and Playwright POM visual      | Implemented scenarios                  |
| Local package validation separates success, warnings, failure, invocation, and internal status | L2-AAK-08                                    | Offline validator verifier and Playwright POM visual       | Implemented scenarios                  |
| C# and Angular profiles resolve structural coverage and user flow to supplied source             | L2-AAK-09, L2-AAK-10                         | Offline ecosystem verifier and Playwright POM visual       | Implemented scenarios                  |
| Authorized reviewer previews protected content without learner writes and records one exact immutable decision | L2-CLI-06, L2-CLI-07; supporting L2-ITA-05 | Domain/API tests and Playwright POM visual | Implemented scenarios |
| Concurrent Administrator publication converges while corrected versions preserve earlier content and assignments | L2-CLI-08, L2-CLI-09; partial L2-ATO-05 | SQLite integration tests and Playwright POM visual | Implemented scenarios |
| Learner sees assigned learning and renders hierarchy, safe blocks, and code reference  | L2-LEX-01, L2-LEX-03, L2-LEX-04               | Angular component test and Playwright golden path      | Implemented scenario                   |
| Angular consumes versioned default/tenant tokens and preserves state under zoom/motion | L2-EXP-01–03                                  | Consumer guard, static conformance, Playwright visuals | Implemented scenarios                  |
| Shell, modal, route, error, and validation status preserve accessible interaction      | L2-EXP-08–10                                  | Axe, component tests, Playwright POM and visuals       | Implemented scenarios                  |
| Lesson source context and large content preserve route, focus, position, and reflow     | L2-EXP-06–07, L2-EXP-14                       | Component tests and responsive Playwright POM visuals  | Implemented scenarios                  |
| System map preserves content, selection, relationships, and descriptions without GPU   | L2-EXP-04–05, L2-EXP-11                       | Capability unit test and Playwright POM visuals        | Implemented scenarios                  |
| Approved profile gates shell, interaction, animation, and privacy-safe measurements    | L2-EXP-12–13                                  | Adapter unit tests and Playwright POM performance gate | Implemented scenarios                  |
| Browser matrix preserves critical flow, fallback, guidance, and safe access             | L2-EXP-15                                     | Three-engine Playwright POM and adapter unit tests      | Implemented scenarios                  |

## Open decisions before baseline approval

The specifications deliberately do not invent answers to PRD section 18. The following decisions require product, architecture, security, legal, or pilot-customer approval before the affected L1/L2 set can be promoted from draft to an approved production baseline.

| PRD decision                                                                | Primary owner                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| SaaS, single-tenant hosted, customer-managed, or combined deployment model  | Security/Privacy and Observability/Supportability                          |
| Initial identity provider, SSO protocol, and provisioning standard          | Identity/Tenancy/Access                                                    |
| Storage of source excerpts versus repository-provider metadata/links        | Curriculum Contract, Codebase Navigation, and Security/Privacy             |
| First repository and document providers                                     | Codebase Navigation and Agent Authoring Kit                                |
| Customer-managed versus managed agent execution                             | Agent Authoring Kit and Security/Privacy                                   |
| Allowed v1 diagram, image, and video formats                                | Curriculum Contract and Experience Platform                                |
| Required locales and translated-variant model                               | Curriculum Contract and Learning Experience                                |
| Retention, learner privacy, manager visibility, and acceptable-use defaults | Administration, Analytics, and Security/Privacy                            |
| Evidence and tenant opt-in for “top learner” indicators                     | Analytics and Reporting                                                    |
| Material-code-change detection and curriculum staleness trigger             | Curriculum Lifecycle and Codebase Navigation                               |
| Informal knowledge check versus internal-certification policy               | Assessment and Mastery                                                     |
| Pilot package, excerpt, course, concurrency, and tenant-scale limits        | Curriculum Contract, Experience Platform, and Observability/Supportability |

## Baseline approval criteria

A subsystem specification is ready for baseline approval when its open decisions are resolved or explicitly deferred, L1 owners and priorities are accepted, every L2 traces to an approved L1, acceptance criteria are testable in an agreed environment, cross-subsystem dependencies have owners, handbook conformance and any documented specializations have been reviewed, and security/privacy/accessibility/operational reviewers have approved the applicable controls.
