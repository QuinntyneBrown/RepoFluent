# RepoFluent Product Requirements Document

| Field | Value |
| --- | --- |
| Product | RepoFluent |
| Document status | Draft for stakeholder review |
| Version | 0.1 |
| Last updated | 2026-07-22 |
| Initial target | Enterprise software teams working in C# and Angular codebases |

## 1. Executive summary

RepoFluent is an enterprise codebase learning platform that turns an organization's source code, architecture documentation, operating knowledge, and training material into a guided, measurable learning experience.

An organization uses an AI agent to analyze approved documents and repositories and produce a standardized curriculum package in JSON. RepoFluent validates that package, generates a polished learning experience from it, and gives learners one place to study systems and subsystems, navigate relevant code, complete courses, quizzes, and tests, and track their progress. Managers and administrators can measure adoption, identify knowledge gaps and strong learners, and understand how much of the supplied curriculum has been learned.

RepoFluent's product promise is:

> Turn enterprise code and documentation into structured, engaging, measurable team knowledge.

The experience should feel modern and exceptionally easy to use. WebGPU and other modern browser capabilities may provide subtle visual depth and micro-animations, but core learning tasks must remain fast, accessible, and fully usable on browsers or devices without WebGPU.

## 2. Problem statement

Enterprise software teams repeatedly spend time explaining the same systems, architecture decisions, domain concepts, and code paths. Important knowledge is fragmented across repositories, internal documentation, tickets, diagrams, and the memories of experienced engineers. Conventional learning-management systems can host generic training but do not connect lessons to a company's actual codebase. Documentation portals expose information but do not create a guided learning path or verify understanding.

This creates several business problems:

- New engineers take too long to become productive.
- Senior engineers lose time to repeated onboarding and support.
- Teams cannot reliably tell whether critical system knowledge has been understood.
- Existing documentation becomes stale and is hard to turn into useful training.
- Codebase knowledge is concentrated in a small number of people, creating continuity risk.
- Organizations lack a consistent format for turning agent-generated analysis into safe, reusable learning content.

## 3. Product vision

RepoFluent should become the learning layer for an enterprise codebase: a place where a learner can move from a system-level explanation to a subsystem, lesson, architecture relationship, and cited code location without losing context.

The platform separates content preparation from content delivery:

1. The organization grants an agent access to approved source material outside RepoFluent or through a future managed integration.
2. The agent follows RepoFluent's `AGENTS.md`, authoring prompts, skills, and curriculum input contract.
3. The agent produces a portable, versioned JSON curriculum package with source references.
4. RepoFluent validates and publishes the package as courses, lessons, code tours, quizzes, and tests.
5. Learners complete the generated experience while RepoFluent records progress and evidence of understanding.
6. Managers review adoption, mastery, knowledge gaps, and curriculum effectiveness.

## 4. Product principles

1. **Enterprise knowledge stays controlled.** Tenant isolation, least-privilege access, auditable operations, and clear source handling are product requirements.
2. **Every lesson has provenance.** Generated claims and code explanations should be traceable to supplied source references wherever possible.
3. **Learning and code navigation are one experience.** RepoFluent should not force learners to choose between a course and a disconnected repository browser.
4. **Agents prepare; humans approve.** Agent-generated packages must be validated and reviewable before publication.
5. **Delight supports comprehension.** Motion and visual effects should clarify state, hierarchy, progress, and relationships rather than distract from the material.
6. **Progress means demonstrated understanding.** Completion, quiz performance, test performance, confidence, and recency are distinct signals.
7. **The content contract is portable and versioned.** Organizations must not be locked into one model, agent, or content-generation workflow.

### 4.1 Engineering standards

The [Engineering handbook](https://github.com/QuinntyneBrown/engineering-handbook) is the normative engineering standard for RepoFluent development.

| ID | Priority | Requirement |
| --- | --- | --- |
| ENG-01 | Must | All RepoFluent development, whether performed by a person or an automated agent, shall adhere to the Engineering handbook, including its product, architecture, design-system, coding, requirements, testing, security, accessibility, documentation, delivery, and definition-of-done standards. |
| ENG-02 | Must | A RepoFluent-specific requirement or accepted architecture decision may specialize a handbook default only when it identifies the affected rule and records the rationale and consequences. An unresolved conflict or undocumented deviation shall block the affected change. |
| ENG-03 | Must | Every change shall retain the conformance evidence required by the handbook and applicable RepoFluent requirements, including traceable requirements and decisions, risk-appropriate test and quality-gate results, affected documentation updates, and a handoff that states verification results and any remaining risk. |

## 5. Goals and non-goals

### 5.1 Goals

- Reduce the time and senior-engineer effort required to onboard developers to an enterprise codebase.
- Let organizations generate curriculum from their own approved documents and C#/Angular repositories.
- Provide a standard JSON contract and authoring kit that different AI agents can use reliably.
- Transform valid uploaded curriculum into a coherent, attractive learning experience with minimal manual assembly.
- Combine system maps, structured courses, code tours, quizzes, and tests.
- Track learner progress, mastery, engagement, and knowledge gaps at individual, team, course, system, and subsystem levels.
- Give administrators a safe workflow to validate, preview, approve, publish, update, and retire curriculum.
- Meet enterprise expectations for security, accessibility, auditability, performance, and identity management.

### 5.2 Non-goals for the initial release

- Acting as a general-purpose source-code editor or replacement for an IDE.
- Automatically modifying a customer's source code.
- Training or fine-tuning foundation models on customer content.
- Performing autonomous production deployments or other operational actions.
- Replacing a full human-resources learning-management system, certification authority, or performance-review process.
- Supporting every programming language and repository provider in the first release.
- Allowing unreviewed agent output to become visible to learners automatically.
- Requiring WebGPU for core navigation, learning, assessment, or administration.

## 6. Users and roles

### 6.1 Primary personas

| Persona | Need | Primary outcome |
| --- | --- | --- |
| Learner | Understand an unfamiliar codebase and prove comprehension | Be productive faster and know what to learn next |
| Technical lead or subject-matter expert | Transfer knowledge without repeating the same explanations | Review accurate curriculum and see where learners struggle |
| Learning or engineering manager | Track onboarding and team capability | See progress, knowledge gaps, and curriculum effectiveness |
| Curriculum author | Convert documents and code analysis into structured material | Produce a valid package and iterate safely |
| Tenant administrator | Manage users, access, settings, and publication | Operate the platform securely and reliably |
| Security or compliance reviewer | Understand content access and handling | Verify controls, audit history, and data boundaries |

### 6.2 Roles and permissions

The initial role model should support:

- **Learner:** view assigned or discoverable published content and their own learning record.
- **Author:** upload packages, view validation results, and edit draft metadata.
- **Reviewer:** preview, comment on, approve, or reject curriculum versions.
- **Manager:** view analytics for explicitly assigned teams or organizational units.
- **Administrator:** manage tenant settings, users, groups, roles, publication, retention, and integrations.
- **Auditor:** read configuration, publication history, access events, and compliance exports without modifying them.

Permissions must be tenant-scoped and capable of being constrained by team, curriculum, system, or repository classification. A user may hold more than one role.

## 7. Core user journeys

### 7.1 Create and publish a curriculum

1. An administrator downloads the current authoring kit and JSON schema.
2. An authorized author points an agent at approved documents and/or a supported codebase.
3. The agent creates a curriculum package and reports sources, omissions, assumptions, and unresolved questions.
4. The author uploads the package to a draft workspace.
5. RepoFluent validates structure, references, assessment integrity, and compatibility.
6. The author resolves blocking errors and reviews non-blocking warnings.
7. A reviewer previews the learner experience and approves a specific immutable version.
8. An administrator publishes the curriculum and assigns it to users or groups.
9. RepoFluent records the publication and assignment in the audit log.

### 7.2 Learn a codebase

1. A learner signs in and sees assigned learning, progress, due dates, and a recommended next activity.
2. The learner opens a course and sees its outcomes, estimated time, prerequisites, and system context.
3. Lessons combine explanation, diagrams or system maps, cited code references, knowledge checks, and code tours.
4. The learner can move from a lesson to a referenced file, symbol, or range while preserving lesson context.
5. RepoFluent saves progress automatically and synchronizes it across sessions.
6. The learner completes quizzes and, where assigned, a controlled test.
7. Results explain strengths, gaps, and recommended review material without exposing protected answers prematurely.
8. The learner and authorized manager see updated progress and mastery indicators.

### 7.3 Inspect team knowledge

1. A manager chooses an authorized team, cohort, system, subsystem, or curriculum.
2. RepoFluent shows assignment status, participation, completion, demonstrated mastery, recency, and common weak areas.
3. The manager drills into an aggregate without gaining access to restricted content or unrelated learner data.
4. The manager assigns remediation or exports an approved summary.

### 7.4 Update curriculum after code changes

1. An agent produces a new package version against an updated source snapshot.
2. RepoFluent compares the draft with the published version and highlights changed lessons, sources, questions, and removed references.
3. Existing learner records remain attached to the version on which they were earned.
4. A reviewer decides whether learners keep credit, receive targeted refresh work, or must retake affected assessments.
5. The new version proceeds through approval and publication.

## 8. Functional requirements

Priority terms are **Must** for launch, **Should** for the first post-launch increment, and **Could** for later consideration.

### 8.1 Identity, tenancy, and access

| ID | Priority | Requirement |
| --- | --- | --- |
| IAM-01 | Must | Isolate all customer content, configuration, users, and analytics by tenant. |
| IAM-02 | Must | Support invitation-based local access for development and at least one enterprise single sign-on path for production. |
| IAM-03 | Must | Enforce role-based access at every API and user-interface boundary. |
| IAM-04 | Must | Allow administrators to organize users into groups or teams and assign curriculum to either individuals or groups. |
| IAM-05 | Must | Record security-sensitive, administrative, authoring, approval, and publication events in an immutable audit history. |
| IAM-06 | Should | Support automated user and group provisioning through a standard enterprise provisioning protocol. |
| IAM-07 | Should | Support configurable session, authentication, and access-review policies. |

### 8.2 Curriculum import and lifecycle

| ID | Priority | Requirement |
| --- | --- | --- |
| CUR-01 | Must | Accept a curriculum package conforming to a published, machine-readable JSON Schema. |
| CUR-02 | Must | Validate schema version, required fields, identifier uniqueness, cross-references, ordering, supported content types, source references, and assessment rules before preview or publication. |
| CUR-03 | Must | Separate errors that block publication from warnings that require acknowledgment. |
| CUR-04 | Must | Present validation issues with a stable code, severity, human explanation, and precise JSON path. |
| CUR-05 | Must | Import valid content into a draft without making it visible to learners. |
| CUR-06 | Must | Provide a reviewable preview that uses the same renderer and access rules as the learner experience. |
| CUR-07 | Must | Require explicit approval before publication and preserve who approved what version and when. |
| CUR-08 | Must | Treat published versions as immutable and preserve learning records against their originating version. |
| CUR-09 | Must | Support unpublishing or retiring a curriculum without deleting its historical records. |
| CUR-10 | Should | Show a semantic comparison between curriculum versions. |
| CUR-11 | Should | Allow safe re-imports to be idempotent using package and entity identifiers. |
| CUR-12 | Could | Offer a visual authoring interface for small edits while retaining contract-compatible export. |

### 8.3 Curriculum input contract and ICD

RepoFluent must publish an Interface Control Document (ICD) for its **Curriculum Input Contract**. The ICD defines the authoritative exchange boundary between content-producing agents and the platform.

At minimum, a package must be able to describe:

- Package identity, contract version, title, description, ownership, locale, and creation metadata.
- The source snapshot used to generate the content, including repositories, branches or commit identifiers, document identifiers, and timestamps where available.
- Systems and subsystems, their responsibilities, boundaries, dependencies, terminology, and relationships.
- Courses, modules, lessons, learning objectives, prerequisites, estimated duration, and difficulty.
- Supported lesson blocks such as prose, callouts, diagrams, system maps, code references, code tours, examples, and knowledge checks.
- Code references using repository-relative paths plus optional commit, symbol, and line anchors; references must never rely on an author's local absolute path.
- Quiz and test definitions, question types, scoring, attempt policy, feedback, answer rationale, and mappings to learning objectives.
- Assignable tags, audience, required or optional status, and completion rules.
- Provenance for generated material, plus declared assumptions, confidence, omissions, and unresolved questions.
- Optional content classification and redaction metadata.

The ICD must also define:

- Semantic versioning and compatibility policy for the contract.
- Canonical encoding, date, duration, identifier, and enumeration formats.
- Required versus optional fields and default behavior.
- Size and nesting limits.
- Extension points that do not compromise forward compatibility.
- Validation error codes and severity semantics.
- Security restrictions, including forbidden secret material and executable payloads.
- Migration and deprecation policy with a supported-version window.
- A minimal valid fixture, a representative C#/Angular fixture, and invalid fixtures for contract testing.

### 8.4 Agent authoring kit

| ID | Priority | Requirement |
| --- | --- | --- |
| AGT-01 | Must | Distribute a versioned authoring kit containing `AGENTS.md`, reusable prompts, one or more `SKILL.md` files, the JSON Schema, the ICD, examples, and a local validation command. |
| AGT-02 | Must | Instruct agents to respect repository guidance, declared scope, access controls, exclusions, and secret-handling rules. |
| AGT-03 | Must | Require generated explanations and learning objectives to cite their supplied sources where a direct source exists. |
| AGT-04 | Must | Require agents to report uncertainty, conflicting source material, missing context, and unsupported assumptions instead of presenting them as facts. |
| AGT-05 | Must | Provide deterministic identifiers or identifier-generation guidance so regenerated packages can be compared and safely re-imported. |
| AGT-06 | Must | Include a validation workflow that can run before any package leaves the customer's approved environment. |
| AGT-07 | Should | Provide language-specific guidance for C# and Angular, including solution structure, dependency injection, API boundaries, components, routes, services, state flow, and tests. |
| AGT-08 | Should | Produce a generation manifest containing tool/model metadata, source snapshot, timestamps, and package checksum without exposing hidden reasoning. |

### 8.5 Learning experience

| ID | Priority | Requirement |
| --- | --- | --- |
| LRN-01 | Must | Show each learner a personalized home page with assignments, status, due dates, recent activity, and a recommended next step. |
| LRN-02 | Must | Render curricula as ordered courses, modules, and lessons with objectives, prerequisites, estimated time, and progress. |
| LRN-03 | Must | Auto-save lesson position and meaningful completion state across sessions and devices. |
| LRN-04 | Must | Provide text search and structured navigation across systems, subsystems, courses, lessons, glossary terms, and permitted code references. |
| LRN-05 | Must | Display system and subsystem relationships and let users move between the map, related learning content, and code. |
| LRN-06 | Must | Provide contextual glossary definitions without forcing the learner to leave the current activity. |
| LRN-07 | Must | Recommend review material after an incorrect answer or low mastery result. |
| LRN-08 | Must | Clearly distinguish required work, optional enrichment, completion, assessment score, and demonstrated mastery. |
| LRN-09 | Should | Allow learner notes and bookmarks that remain private by default. |
| LRN-10 | Should | Support spaced review recommendations based on performance and recency. |
| LRN-11 | Could | Support approved cohort discussion or expert Q&A attached to content. |

### 8.6 Codebase navigation

| ID | Priority | Requirement |
| --- | --- | --- |
| CODE-01 | Must | Render syntax-highlighted, read-only C# and Angular source excerpts supplied or referenced by the curriculum package. |
| CODE-02 | Must | Support deep links from a lesson or assessment explanation to an authorized repository, file, symbol, and line range. |
| CODE-03 | Must | Preserve course context while a learner follows a code tour across multiple references. |
| CODE-04 | Must | Display the source snapshot or revision associated with a reference and warn when it may not match the current repository state. |
| CODE-05 | Must | Respect content-level and repository-level access restrictions when rendering or linking code. |
| CODE-06 | Should | Provide a navigable file tree and symbol relationships for imported metadata. |
| CODE-07 | Should | Visualize selected call, dependency, route, component, and data-flow relationships supplied by the package. |
| CODE-08 | Could | Connect to supported repository providers for current, authorized read-only views. |

For the initial release, RepoFluent is a learning-oriented navigator, not a full static-analysis engine. The agent or upstream content pipeline is responsible for producing the relevant code metadata in the standardized package.

### 8.7 Quizzes, tests, and mastery

| ID | Priority | Requirement |
| --- | --- | --- |
| ASM-01 | Must | Support single-choice, multiple-choice, true/false, ordering, matching, and short-answer questions when the package provides a deterministic grading method. |
| ASM-02 | Must | Support formative quizzes with immediate configurable feedback and summative tests with configurable feedback release. |
| ASM-03 | Must | Support question pools, deterministic or randomized selection, passing thresholds, attempt limits, and time limits. |
| ASM-04 | Must | Map each scored item to one or more learning objectives, systems, or subsystems. |
| ASM-05 | Must | Preserve an auditable attempt record including curriculum version, item version, score, timestamps, and grading outcome. |
| ASM-06 | Must | Keep answer keys and protected explanations inaccessible before their configured release point. |
| ASM-07 | Must | Explain scoring and completion rules to the learner before an attempt begins. |
| ASM-08 | Should | Allow authorized reviewers to invalidate a defective question and recalculate affected outcomes. |
| ASM-09 | Should | Detect basic signs of low-quality assessment content such as duplicates, answer leakage, missing rationale, and objectives with no coverage. |

Mastery must not be represented by a single opaque score. The product should expose the inputs used, which may include completion, objective coverage, latest result, best result, attempts, confidence, and result recency. The launch calculation must be documented and tenant-consistent.

### 8.8 Analytics and reporting

| ID | Priority | Requirement |
| --- | --- | --- |
| ANL-01 | Must | Show learners their assignments, completion, results, objective coverage, and recommended next actions. |
| ANL-02 | Must | Show authorized managers aggregate participation, completion, mastery, result distribution, time-on-learning, and common knowledge gaps. |
| ANL-03 | Must | Support drill-down by curriculum, version, course, system, subsystem, objective, team, cohort, and permitted learner. |
| ANL-04 | Must | Distinguish not started, in progress, completed, passed, failed, overdue, and stale knowledge states. |
| ANL-05 | Must | Let authorized users identify high-performing learners using transparent, configurable indicators rather than a hidden ranking algorithm. |
| ANL-06 | Must | Apply minimum-group and permission rules to prevent inappropriate disclosure through small aggregate groups. |
| ANL-07 | Must | Export authorized reports in a common machine-readable format. |
| ANL-08 | Should | Measure content quality signals such as abandonment, repeated failure, question discrimination, and learner feedback. |
| ANL-09 | Should | Compare cohorts and curriculum versions while clearly labeling population and time-window differences. |

“How much has been learned” should be reported through multiple comprehensible measures:

- Assigned curriculum completion.
- Learning-objective coverage.
- Demonstrated mastery by objective and system/subsystem.
- Assessment performance and attempt history.
- Knowledge recency or staleness.
- Self-reported confidence, if enabled.

### 8.9 Administration and operations

| ID | Priority | Requirement |
| --- | --- | --- |
| ADM-01 | Must | Allow authorized administrators to manage users, groups, roles, curricula, assignments, and tenant settings. |
| ADM-02 | Must | Show content processing, validation, review, and publication status with actionable failure details. |
| ADM-03 | Must | Support configurable retention and deletion workflows for content and learning records, subject to audit and legal constraints. |
| ADM-04 | Must | Provide operational health and support diagnostics without exposing curriculum content unnecessarily. |
| ADM-05 | Should | Support branded tenant name, logo, color tokens, and approved sign-in messaging without compromising accessibility. |
| ADM-06 | Should | Provide notifications for assignments, due dates, publication events, and validation failures with per-user controls. |

## 9. Experience and visual design requirements

RepoFluent should communicate quality through clarity, responsiveness, typography, spatial consistency, and restrained motion. “Gorgeous” is translated into testable experience requirements rather than dependence on a particular rendering technology.

### 9.1 Interaction and visual system

- Establish a cohesive design-token system for color, type, spacing, elevation, motion, and data visualization.
- Use micro-animations to clarify navigation, saved state, progress, expansion, focus, success, and relationships.
- Use WebGPU progressively for suitable system visualizations, ambient depth, or transitions; provide an equivalent non-WebGPU renderer.
- Never make an assessment answer, navigation control, status, or required explanation available only through animation, hover, color, or a GPU effect.
- Keep motion short and interruptible and honor the user's reduced-motion preference throughout the product.
- Preserve learner context through split views, drawers, breadcrumbs, and back navigation instead of opening unnecessary new pages.
- Design responsive experiences for supported desktop and tablet sizes; assessment and core lesson flows should remain usable on a narrow viewport.

### 9.2 Accessibility

- Meet WCAG 2.2 AA for launch-critical flows.
- Support keyboard-only navigation with visible focus and logical focus order.
- Provide semantic structure, accessible names, status announcements, and text alternatives for meaningful visualizations.
- Offer a non-canvas or accessible companion representation for interactive system maps and GPU-rendered content.
- Do not use motion that can block comprehension or trigger without a way to reduce it.
- Test the learner, assessment, import, review, and analytics flows with automated and manual accessibility checks.

### 9.3 Performance budgets

On a supported production browser and a representative enterprise connection:

- The learner shell should become usable within 2.5 seconds at the 75th percentile, excluding a customer's unusually large optional asset.
- Typical interaction latency should remain below 200 milliseconds at the 75th percentile.
- Micro-animations should target 60 frames per second and avoid long main-thread tasks.
- A WebGPU initialization or rendering failure must not prevent core content from loading.
- Long lessons, file trees, tables, and analytics views must use pagination, virtualization, or progressive loading where needed.

Exact measurement profiles and supported-browser versions must be defined before launch and monitored in production.

## 10. Data model

The conceptual model includes:

| Entity | Purpose |
| --- | --- |
| Tenant | Security and data-isolation boundary |
| User, group, role | Identity, organization, and authorization |
| Source snapshot | Reproducible record of the repositories and documents used |
| System, subsystem, relationship | Architecture and domain map |
| Curriculum, course, module, lesson | Ordered learning structure |
| Learning objective | Unit of expected understanding and reporting |
| Content block | Renderable lesson material or interactive element |
| Code reference, code tour | Link between explanation and source context |
| Assessment, question, answer policy | Quiz and test definition |
| Curriculum version | Immutable published content boundary |
| Assignment | Required or optional learning allocated to a user or group |
| Progress event | Durable evidence of learner activity and state change |
| Assessment attempt | Immutable record of submitted answers and grading outcome |
| Mastery record | Explainable, derived objective-level learning state |
| Audit event | Security and administrative history |

Stable identifiers from the imported package must remain separate from platform-generated tenant and record identifiers. This prevents an author from crossing tenant boundaries or overwriting another entity by choosing an identifier.

## 11. Security, privacy, and compliance requirements

- Encrypt customer data in transit and at rest using organization-approved mechanisms.
- Prevent tenant data from being used to train shared models unless a customer explicitly authorizes a separate documented process.
- Treat source code, documentation, prompts, generated curriculum, answer keys, learner activity, and analytics as customer data.
- Scan uploads for malformed content and enforce type, schema, count, nesting, and size limits before processing.
- Do not execute scripts, binaries, macros, or source code contained in a curriculum package.
- Sanitize renderable content and disallow arbitrary active HTML or remote resources by default.
- Provide logical separation between answer keys and learner-visible assessment data.
- Minimize stored source content: packages should include only the excerpts or metadata needed for the approved learning experience.
- Support configurable data classification and retention; deletion must address derived search indexes, caches, and analytics as applicable.
- Record administrative access, package uploads, validation, approvals, publication, role changes, report exports, and sensitive content access.
- Define backup, restore, incident response, vulnerability management, and dependency update procedures before production launch.
- Complete a formal threat model and privacy review before handling production customer code.

## 12. Observability and supportability

- Emit structured telemetry for authentication, import, validation, rendering, progress capture, grading, publication, and authorization decisions.
- Use correlation identifiers across browser, API, background processing, and audit events.
- Monitor import failure rate, page and interaction performance, assessment submission failures, content-rendering errors, and stale processing jobs.
- Avoid logging source excerpts, secrets, answer contents, access tokens, or sensitive free-text fields by default.
- Provide administrators with user-safe error identifiers that support staff can correlate with operational telemetry.
- Make progress writes and assessment submissions retry-safe so transient failures do not duplicate or lose learner records.

## 13. Success metrics

Baseline values must be measured during pilots. Launch targets should then be confirmed with product and customer stakeholders.

### 13.1 North-star outcome

**Time to demonstrated codebase proficiency:** median elapsed time from assignment to successful completion of the required objectives for a defined system or subsystem.

### 13.2 Supporting metrics

| Area | Metric | Initial product target |
| --- | --- | --- |
| Authoring | Valid package to publishable preview | Under 10 minutes for a representative package, excluding human review |
| Authoring | First-upload validation clarity | At least 90% of pilot authors can locate and explain a seeded issue without support |
| Adoption | Assigned learners who start within seven days | At least 80% in active pilot cohorts |
| Learning | Required curriculum completion | At least 75% by the configured due date in active pilot cohorts |
| Learning | Objective mastery improvement | Positive pre- versus post-assessment change for the majority of measured objectives |
| Efficiency | Senior-engineer onboarding support time | At least 25% lower than the customer's pre-pilot baseline |
| Quality | Learner usefulness rating | At least 4.2 out of 5 |
| Reliability | Successful progress and assessment writes | At least 99.9%, excluding rejected invalid requests |
| Accessibility | Critical launch-flow accessibility defects | Zero known critical defects at release |
| Performance | Learner-shell usability target | At least 75% of measured production loads within the defined 2.5-second budget |

Metrics must be filterable by curriculum version and cohort so content or product changes are not hidden inside blended totals.

## 14. Release scope

### 14.1 MVP / pilot

The pilot release includes:

- Tenant, user, group, basic role, and assignment management.
- Authentication suitable for a controlled pilot and one production enterprise SSO integration path.
- Curriculum Input Contract v1, JSON Schema, ICD, fixtures, validation tool, and authoring kit.
- Draft upload, actionable validation, preview, human approval, publication, retirement, and immutable version history.
- Systems, subsystems, courses, modules, lessons, glossary, code references, and guided code tours.
- C# and Angular syntax presentation and repository-relative source anchors.
- Quizzes and tests with objective mapping, scoring, attempts, and feedback policies.
- Learner dashboard, auto-saved progress, search, and recommended next activity.
- Manager analytics for assignment, completion, performance, objective coverage, gaps, and high-performing learners.
- Audit history, baseline retention controls, telemetry, accessibility, and progressive WebGPU enhancement with fallback.

### 14.2 Post-MVP candidates

- Automated provisioning and broader identity-provider support.
- Additional repository providers and programming languages.
- Managed, read-only document and repository ingestion.
- Curriculum version diff and agent-assisted refresh workflows.
- Spaced review, richer recommendations, learner notes, and bookmarks.
- Visual authoring for supported contract content.
- Approved integrations with HR, learning, messaging, and developer platforms.
- Advanced cohort, content-quality, and organizational knowledge-risk analytics.
- Private deployment or customer-managed infrastructure options if validated by demand.

## 15. Acceptance criteria for the pilot

The pilot is ready for customer use when all of the following are true:

1. An authorized author can generate a package using the distributed kit, validate it locally, and upload it without exposing local absolute paths or secrets.
2. Invalid packages cannot be published, and every blocking error identifies a stable error code and JSON path.
3. A reviewer can preview and approve a version; a learner cannot see it before publication or assignment.
4. A published representative C#/Angular curriculum renders systems, lessons, code references, one multi-step code tour, quizzes, and a controlled test.
5. A learner can leave and resume on another supported device without losing meaningful progress.
6. An authorized manager can see completion and objective-level results for their cohort but cannot access another cohort or tenant.
7. Updating a curriculum creates a new immutable version and does not change prior assessment evidence.
8. Learner-critical flows work with WebGPU unavailable and with reduced motion enabled.
9. The launch-critical flows pass the agreed security, accessibility, performance, backup/restore, and operational-readiness checks.
10. Audit history identifies package upload, review, approval, publication, assignment, report export, role change, and retirement actors and timestamps.

## 16. Dependencies

- A reviewed Curriculum Input Contract and ownership for its versioning.
- An agreed authoring-agent environment and local validator distribution method.
- Identity provider and organizational group information for pilot customers.
- Representative, permission-cleared C# and Angular repositories and documentation for testing.
- Security, privacy, legal, accessibility, and enterprise architecture review.
- Product design system and browser-support policy.
- Defined analytics semantics for completion, mastery, knowledge gaps, and high-performing learners.
- A customer support and incident-response model.

## 17. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Agent output is inaccurate or invents system behavior | Learners develop false understanding | Require provenance, uncertainty reporting, automated validation, human review, versioning, and feedback |
| Source code or secrets leak through generated packages | Severe customer and compliance harm | Use approved environments, minimization guidance, secret scanning, access controls, sanitization, and audit logs |
| Curriculum becomes stale as code changes | Trust and learning quality decline | Record source snapshots, show staleness, compare versions, and support targeted refresh workflows |
| Visual effects reduce usability or performance | Learners abandon the product | Set budgets, use progressive enhancement, honor reduced motion, and maintain an equivalent fallback |
| Analytics become a punitive employee ranking | Low trust and inappropriate management decisions | Use transparent measures, scoped access, minimum groups, context, and an explicit acceptable-use policy |
| JSON contract is too rigid or too permissive | Agent interoperability or renderer safety suffers | Version the contract, provide extensions, fixtures, limits, compatibility tests, and a deprecation policy |
| Code references drift or expose inaccessible paths | Broken learning flow or unauthorized access | Bind to source snapshots, use repository-relative anchors, warn on drift, and re-check authorization |
| Assessment questions test trivia rather than capability | Scores do not represent proficiency | Map items to objectives, require rationale, review coverage, analyze item quality, and combine multiple mastery signals |

## 18. Open decisions

These questions do not block the PRD draft, but they must be resolved before production scope is committed:

1. Is the first commercial deployment multi-tenant SaaS, single-tenant hosted, customer-managed, or a combination?
2. Which identity provider, SSO protocol, and provisioning method are required by the first pilot customer?
3. Will RepoFluent store approved source excerpts, or only metadata and authenticated links back to a repository provider?
4. Which repository providers and document systems must be supported first?
5. Is agent execution always customer-managed for MVP, or must RepoFluent offer a managed generation workflow?
6. Which content formats beyond structured text and code are allowed in v1, particularly diagrams, images, and video?
7. Which locales are required, and may one package contain translated variants?
8. What are the default data retention, learner privacy, manager visibility, and acceptable-use policies?
9. What evidence should qualify someone as a “top learner,” and should that capability be opt-in by tenant?
10. How will material code changes trigger staleness notifications or curriculum regeneration?
11. Are tests intended for informal knowledge checks, internal certification, or both?
12. What package size, code excerpt, course length, concurrency, and tenant-scale limits should define the pilot profile?

## 19. Product decisions recorded by this draft

- The standardized JSON boundary is a first-class product surface, not an internal implementation detail.
- The contract is documented through an ICD and enforced through a machine-readable schema and validator.
- Agent-generated content requires human approval before publication.
- C# and Angular are the first language/ecosystem targets.
- Published curriculum versions and completed assessment evidence are immutable.
- Core learning does not depend on WebGPU; GPU experiences progressively enhance a complete accessible interface.
- Mastery and high-learner identification use transparent signals rather than an unexplained composite ranking.
- Direct repository ingestion and managed agent execution are deferred until deployment and security requirements are validated.
