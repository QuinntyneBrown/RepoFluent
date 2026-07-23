#!/usr/bin/env python3
"""Generate requirement-traceable feature designs from docs/specs.

The feature map is curated because vertical slices are architectural choices.
Requirement text and primary L1 traceability are parsed from the specification
baseline so generated design tables cannot silently drift from their source.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPECS_ROOT = ROOT / "docs" / "specs"
DESIGNS_ROOT = ROOT / "docs" / "detailed-designs"


@dataclass(frozen=True)
class Requirement:
    identifier: str
    title: str
    primary_l1: str
    text: str


@dataclass(frozen=True)
class Profile:
    display_name: str
    purpose: str
    actor: str
    actor_description: str
    entry_name: str
    entry_technology: str
    entry_description: str
    entry_suffix: str
    client_name: str
    api_name: str
    api_technology: str
    store_name: str
    store_technology: str
    dependency_name: str
    dependency_description: str


PROFILES = {
    "01-identity-tenancy-access": Profile(
        "Identity, Tenancy, and Access",
        "establishes tenant identity, authentication, authorization, groups, sessions, and access evidence",
        "Tenant administrator",
        "Administers tenant identities and access policy",
        "Identity administration",
        "Angular 21",
        "Tenant-scoped identity and access interface",
        "Page",
        "IdentityAccessApiClient",
        "RepoFluent Identity API",
        "ASP.NET Core",
        "Identity and access store",
        "<TO SUPPLY>",
        "Enterprise identity provider",
        "Authenticates or provisions users through a selected enterprise standard",
    ),
    "02-curriculum-input-contract": Profile(
        "Curriculum Input Contract",
        "defines the portable curriculum package, its compatibility rules, and its conformance artifacts",
        "Contract maintainer",
        "Publishes and validates curriculum contract releases",
        "Contract workbench",
        ".NET tool",
        "Contract authoring and conformance interface",
        "Workbench",
        "ContractRegistryClient",
        "Contract Registry API",
        "ASP.NET Core",
        "Contract artifact store",
        "<TO SUPPLY>",
        "Artifact distribution service",
        "Distributes checksummed schema, ICD, fixture, and release artifacts",
    ),
    "03-agent-authoring-kit": Profile(
        "Agent Authoring Kit",
        "guides approved agents from declared source scope to a locally validated curriculum package",
        "Curriculum authoring agent",
        "Analyzes approved source material under repository instructions",
        "Authoring Kit CLI",
        ".NET tool",
        "Offline authoring and validation interface",
        "Cli",
        "AuthoringKitClient",
        "Local Validator",
        ".NET",
        "Authoring workspace",
        "File system",
        "Approved source repositories",
        "Provide the declared code and document snapshot",
    ),
    "04-curriculum-lifecycle": Profile(
        "Curriculum Lifecycle",
        "moves curriculum packages through intake, validation, draft, review, publication, comparison, and retirement",
        "Curriculum operator",
        "Authors, reviews, publishes, or retires curriculum within an assigned role",
        "Curriculum administration",
        "Angular 21",
        "Curriculum lifecycle interface",
        "Page",
        "CurriculumLifecycleApiClient",
        "Curriculum Lifecycle API",
        "ASP.NET Core",
        "Curriculum store",
        "<TO SUPPLY>",
        "Content scanning service",
        "Evaluates uploaded packages for configured content threats",
    ),
    "05-learning-experience": Profile(
        "Learning Experience",
        "presents assigned curriculum, records durable progress, and preserves learning context",
        "Learner",
        "Studies assigned curriculum and records learning activity",
        "Learner application",
        "Angular 21",
        "Responsive course and lesson interface",
        "Page",
        "LearningApiClient",
        "Learning API",
        "ASP.NET Core",
        "Learning record store",
        "<TO SUPPLY>",
        "Search service",
        "Indexes permitted published learning content",
    ),
    "06-codebase-navigation": Profile(
        "Codebase Navigation",
        "connects lessons to inert source excerpts, tours, repository metadata, and architecture relationships",
        "Learner",
        "Explores approved source context while retaining lesson position",
        "Code navigator",
        "Angular 21",
        "Source, tour, tree, and relationship interface",
        "Page",
        "CodeNavigationApiClient",
        "Code Navigation API",
        "ASP.NET Core",
        "Code metadata store",
        "<TO SUPPLY>",
        "Repository provider",
        "Provides authorized read-only repository metadata where configured",
    ),
    "07-assessment-mastery": Profile(
        "Assessment and Mastery",
        "runs governed assessments, protects answer data, retains attempt evidence, and calculates mastery",
        "Learner",
        "Completes formative and summative assessments",
        "Assessment application",
        "Angular 21",
        "Assessment and mastery interface",
        "Page",
        "AssessmentApiClient",
        "Assessment API",
        "ASP.NET Core",
        "Assessment evidence store",
        "<TO SUPPLY>",
        "Time service",
        "Provides trusted assessment timing",
    ),
    "08-analytics-reporting": Profile(
        "Analytics and Reporting",
        "turns versioned learning evidence into authorized, privacy-safe measures and reports",
        "Authorized analytics user",
        "Inspects learner or population measures within granted scope",
        "Analytics application",
        "Angular 21",
        "Learner, manager, and reviewer analytics interface",
        "Page",
        "AnalyticsApiClient",
        "Analytics API",
        "ASP.NET Core",
        "Analytics store",
        "<TO SUPPLY>",
        "Export delivery service",
        "Delivers expiring authorized report artifacts",
    ),
    "09-administration-operations": Profile(
        "Administration and Tenant Operations",
        "coordinates tenant users, curricula, assignments, policies, diagnostics, branding, and notifications",
        "Tenant administrator",
        "Operates authorized tenant configuration and workflows",
        "Administration application",
        "Angular 21",
        "Tenant administration interface",
        "Page",
        "AdministrationApiClient",
        "Administration API",
        "ASP.NET Core",
        "Tenant operations store",
        "<TO SUPPLY>",
        "Notification provider",
        "Delivers configured tenant notification channels",
    ),
    "10-experience-platform": Profile(
        "Experience Platform",
        "provides design-system, accessibility, responsive, capability, and performance foundations",
        "RepoFluent user",
        "Operates RepoFluent through a supported browser and input method",
        "RepoFluent web application",
        "Angular 21",
        "Shared application shell and design-system components",
        "Page",
        "ExperienceTelemetryClient",
        "Experience Platform API",
        "ASP.NET Core",
        "Experience telemetry store",
        "<TO SUPPLY>",
        "Browser platform",
        "Provides accessibility, rendering, navigation, and optional GPU capabilities",
    ),
    "11-security-privacy-compliance": Profile(
        "Security, Privacy, and Compliance",
        "protects customer data and establishes security, privacy, retention, and release controls",
        "Security administrator",
        "Reviews controls, evidence, and exceptions within authorized scope",
        "Security administration",
        "Angular 21",
        "Security and privacy control interface",
        "Page",
        "SecurityApiClient",
        "Security Control API",
        "ASP.NET Core",
        "Security evidence store",
        "<TO SUPPLY>",
        "Key and secret management service",
        "Protects approved keys, credentials, and cryptographic operations",
    ),
    "12-observability-supportability": Profile(
        "Observability and Supportability",
        "provides telemetry, diagnosis, reliability controls, recovery evidence, and operational release gates",
        "Platform operator",
        "Monitors and supports RepoFluent within approved operational access",
        "Operations console",
        "Angular 21",
        "Operational monitoring and support interface",
        "Console",
        "OperationsApiClient",
        "Operations API",
        "ASP.NET Core",
        "Operational telemetry store",
        "<TO SUPPLY>",
        "Monitoring and alerting platform",
        "Collects approved telemetry and routes actionable alerts",
    ),
}


# A vertical feature owns one coherent outcome and one to four L2 requirements.
FEATURES = {
    "01-identity-tenancy-access": [
        ("enforce-tenant-boundaries", "Enforce tenant boundaries", ["L2-ITA-01", "L2-ITA-11"]),
        ("onboard-and-authenticate-users", "Onboard and authenticate users", ["L2-ITA-02", "L2-ITA-03"]),
        ("authorize-roles-and-scopes", "Authorize roles and scopes", ["L2-ITA-04", "L2-ITA-05"]),
        ("manage-groups-and-provisioning", "Manage groups and provisioning", ["L2-ITA-06", "L2-ITA-08"]),
        ("govern-sessions-and-access-reviews", "Govern sessions and access reviews", ["L2-ITA-09", "L2-ITA-10"]),
        ("record-identity-audit-evidence", "Record identity audit evidence", ["L2-ITA-07"]),
    ],
    "02-curriculum-input-contract": [
        ("publish-versioned-contract", "Publish a versioned contract", ["L2-CIC-01", "L2-CIC-12", "L2-CIC-14"]),
        ("model-curriculum-package", "Model a curriculum package", ["L2-CIC-02", "L2-CIC-03", "L2-CIC-06"]),
        ("define-safe-content-and-code", "Define safe content and code", ["L2-CIC-04", "L2-CIC-05"]),
        ("record-provenance-and-identities", "Record provenance and identities", ["L2-CIC-07", "L2-CIC-08", "L2-CIC-09"]),
        ("validate-packages-and-limits", "Validate packages and limits", ["L2-CIC-10", "L2-CIC-11"]),
        ("support-contract-extensions", "Support contract extensions", ["L2-CIC-13"]),
    ],
    "03-agent-authoring-kit": [
        ("publish-authoring-kit", "Publish the authoring kit", ["L2-AAK-01", "L2-AAK-12"]),
        ("constrain-agent-scope", "Constrain agent scope", ["L2-AAK-02", "L2-AAK-03", "L2-AAK-04"]),
        ("cite-sources-and-uncertainty", "Cite sources and uncertainty", ["L2-AAK-05", "L2-AAK-06"]),
        ("generate-stable-curriculum", "Generate stable curriculum", ["L2-AAK-07", "L2-AAK-11"]),
        ("validate-packages-locally", "Validate packages locally", ["L2-AAK-08"]),
        ("analyze-dotnet-and-angular", "Analyze .NET and Angular", ["L2-AAK-09", "L2-AAK-10"]),
    ],
    "04-curriculum-lifecycle": [
        ("receive-and-validate-package", "Receive and validate a package", ["L2-CLI-01", "L2-CLI-02", "L2-CLI-03", "L2-CLI-04"]),
        ("import-draft-idempotently", "Import a draft idempotently", ["L2-CLI-05", "L2-CLI-12"]),
        ("preview-and-review-draft", "Preview and review a draft", ["L2-CLI-06", "L2-CLI-07"]),
        ("publish-immutable-version", "Publish an immutable version", ["L2-CLI-08", "L2-CLI-09"]),
        ("compare-and-retire-versions", "Compare and retire versions", ["L2-CLI-10", "L2-CLI-11"]),
        ("operate-and-audit-lifecycle", "Operate and audit the lifecycle", ["L2-CLI-13", "L2-CLI-14"]),
        ("edit-contract-content", "Edit contract-compatible content", ["L2-CLI-15"]),
    ],
    "05-learning-experience": [
        ("present-learning-home", "Present the learning home", ["L2-LEX-01", "L2-LEX-02", "L2-LEX-11"]),
        ("render-course-lessons", "Render course lessons", ["L2-LEX-03", "L2-LEX-04", "L2-LEX-16"]),
        ("track-and-resume-progress", "Track and resume progress", ["L2-LEX-05", "L2-LEX-06"]),
        ("search-and-navigate-learning", "Search and navigate learning", ["L2-LEX-07", "L2-LEX-08", "L2-LEX-09"]),
        ("recommend-remediation-and-review", "Recommend remediation and review", ["L2-LEX-10", "L2-LEX-14"]),
        ("manage-private-learning-artifacts", "Manage private learning artifacts", ["L2-LEX-12", "L2-LEX-13"]),
        ("moderate-learning-discussion", "Moderate learning discussion", ["L2-LEX-15"]),
    ],
    "06-codebase-navigation": [
        ("render-and-resolve-code", "Render and resolve code", ["L2-CBN-01", "L2-CBN-02", "L2-CBN-07", "L2-CBN-12"]),
        ("open-external-code-links", "Open external code links", ["L2-CBN-03"]),
        ("follow-code-tours", "Follow code tours", ["L2-CBN-04"]),
        ("show-source-snapshot-drift", "Show source snapshot drift", ["L2-CBN-05", "L2-CBN-06", "L2-CBN-11"]),
        ("browse-files-and-symbols", "Browse files and symbols", ["L2-CBN-08", "L2-CBN-09"]),
        ("explore-architecture-relationships", "Explore architecture relationships", ["L2-CBN-10"]),
    ],
    "07-assessment-mastery": [
        ("render-assessment-items", "Render assessment items", ["L2-ASM-01", "L2-ASM-02", "L2-ASM-03", "L2-ASM-04"]),
        ("start-governed-attempts", "Start governed attempts", ["L2-ASM-05", "L2-ASM-06", "L2-ASM-07", "L2-ASM-08"]),
        ("save-and-submit-responses", "Save and submit responses", ["L2-ASM-09", "L2-ASM-11"]),
        ("grade-assessment-outcomes", "Grade assessment outcomes", ["L2-ASM-10", "L2-ASM-12"]),
        ("manage-objective-coverage", "Manage objective coverage", ["L2-ASM-13", "L2-ASM-15"]),
        ("invalidate-defective-items", "Invalidate defective items", ["L2-ASM-14"]),
        ("calculate-explainable-mastery", "Calculate explainable mastery", ["L2-ASM-16", "L2-ASM-17"]),
    ],
    "08-analytics-reporting": [
        ("govern-metric-definitions", "Govern metric definitions", ["L2-ANR-01", "L2-ANR-05", "L2-ANR-06"]),
        ("show-learner-analytics", "Show learner analytics", ["L2-ANR-02"]),
        ("explore-manager-analytics", "Explore manager analytics", ["L2-ANR-03", "L2-ANR-04", "L2-ANR-09"]),
        ("identify-gaps-and-performance", "Identify gaps and performance", ["L2-ANR-07", "L2-ANR-08"]),
        ("export-reports", "Export reports", ["L2-ANR-10"]),
        ("analyze-content-and-cohorts", "Analyze content and cohorts", ["L2-ANR-11", "L2-ANR-12"]),
        ("preserve-versioned-analytics", "Preserve versioned analytics", ["L2-ANR-13", "L2-ANR-14", "L2-ANR-15"]),
    ],
    "09-administration-operations": [
        ("navigate-tenant-administration", "Navigate tenant administration", ["L2-ATO-01"]),
        ("manage-users-groups-and-roles", "Manage users, groups, and roles", ["L2-ATO-02", "L2-ATO-03", "L2-ATO-14"]),
        ("administer-curricula-and-status", "Administer curricula and status", ["L2-ATO-04", "L2-ATO-07"]),
        ("manage-assignments", "Manage assignments", ["L2-ATO-05", "L2-ATO-06"]),
        ("govern-retention-and-deletion", "Govern retention and deletion", ["L2-ATO-08", "L2-ATO-09"]),
        ("access-support-diagnostics", "Access support diagnostics", ["L2-ATO-10"]),
        ("configure-tenant-branding", "Configure tenant branding", ["L2-ATO-11"]),
        ("deliver-tenant-notifications", "Deliver tenant notifications", ["L2-ATO-12", "L2-ATO-13"]),
    ],
    "10-experience-platform": [
        ("govern-design-system", "Govern the design system", ["L2-EXP-01", "L2-EXP-02", "L2-EXP-03"]),
        ("provide-progressive-visualizations", "Provide progressive visualizations", ["L2-EXP-04", "L2-EXP-05", "L2-EXP-11"]),
        ("preserve-responsive-navigation", "Preserve responsive navigation", ["L2-EXP-06", "L2-EXP-07", "L2-EXP-14"]),
        ("enforce-accessible-interaction", "Enforce accessible interaction", ["L2-EXP-08", "L2-EXP-09", "L2-EXP-10"]),
        ("meet-performance-budgets", "Meet performance budgets", ["L2-EXP-12", "L2-EXP-13"]),
        ("govern-browser-capabilities", "Govern browser capabilities", ["L2-EXP-15"]),
    ],
    "11-security-privacy-compliance": [
        ("isolate-tenants-and-identifiers", "Isolate tenants and identifiers", ["L2-SPC-01", "L2-SPC-17"]),
        ("control-privileged-access", "Control privileged access", ["L2-SPC-02"]),
        ("encrypt-data-and-manage-keys", "Encrypt data and manage keys", ["L2-SPC-03", "L2-SPC-04"]),
        ("restrict-model-data-use", "Restrict model data use", ["L2-SPC-05"]),
        ("secure-content-intake-and-rendering", "Secure content intake and rendering", ["L2-SPC-06", "L2-SPC-07", "L2-SPC-08"]),
        ("protect-answers-and-source", "Protect answers and source", ["L2-SPC-09", "L2-SPC-10", "L2-SPC-11"]),
        ("retain-delete-and-audit-data", "Retain, delete, and audit data", ["L2-SPC-12", "L2-SPC-13"]),
        ("redact-operational-data", "Redact operational data", ["L2-SPC-14"]),
        ("govern-security-readiness", "Govern security readiness", ["L2-SPC-15", "L2-SPC-16"]),
    ],
    "12-observability-supportability": [
        ("standardize-telemetry-and-correlation", "Standardize telemetry and correlation", ["L2-OBS-01", "L2-OBS-02", "L2-OBS-03"]),
        ("monitor-import-and-learning", "Monitor import and learning", ["L2-OBS-04", "L2-OBS-05", "L2-OBS-06"]),
        ("guarantee-idempotent-learning-writes", "Guarantee idempotent learning writes", ["L2-OBS-07", "L2-OBS-08"]),
        ("protect-logs-and-errors", "Protect logs and errors", ["L2-OBS-09", "L2-OBS-10"]),
        ("provide-tenant-diagnostics", "Provide tenant diagnostics", ["L2-OBS-11"]),
        ("govern-service-reliability", "Govern service reliability", ["L2-OBS-12", "L2-OBS-16"]),
        ("back-up-and-restore-state", "Back up and restore state", ["L2-OBS-13", "L2-OBS-14"]),
        ("respond-to-incidents", "Respond to incidents", ["L2-OBS-15"]),
        ("gate-production-releases", "Gate production releases", ["L2-OBS-17"]),
    ],
}


EXPERIENCE_DESIGNS = {
    "govern-design-system": {
        "actor": "Product contributor",
        "actor_description": "Maintains and reviews the shared design contract",
        "outcome": "maintains semantic tokens, reusable component states, and reduced-motion behavior as one versioned interface contract",
        "assets": [
            ("desigh-system/assets/tokens.css", "authoritative `--rf-*` semantic token and reduced-motion contract"),
            ("desigh-system/assets/components.css", "reusable product-facing `.rf-*` component contracts"),
            ("desigh-system/assets/docs.js", "documentation navigation and progressively enhanced component examples"),
            ("desigh-system/foundations/", "reference pages for color, type, spacing, motion, and accessibility"),
            ("desigh-system/tests/smoke.spec.js", "Playwright checks for loading, keyboard behavior, focus restoration, and narrow layouts"),
        ],
    },
    "provide-progressive-visualizations": {
        "actor": "Learner",
        "actor_description": "Uses visual and semantic representations of learning content",
        "outcome": "keeps visualization content operable when GPU or visual presentation is unavailable",
        "assets": [
            ("desigh-system/components/data-visualization.html", "chart, legend, status, and semantic data-reference examples"),
            ("desigh-system/patterns/system-map.html", "architecture-map reference with a non-canvas learning path"),
            ("desigh-system/assets/components.css", "shared visual and accessible companion presentation contracts"),
            ("desigh-system/assets/docs.js", "keyboard graph selection and synchronized inspector examples"),
            ("desigh-system/foundations/accessibility.html", "text-alternative and equivalent-interaction guidance"),
        ],
    },
    "preserve-responsive-navigation": {
        "actor": "RepoFluent user",
        "actor_description": "Navigates learning and administration at a supported viewport",
        "outcome": "preserves route, focus, and domain context across responsive layouts and large content",
        "assets": [
            ("desigh-system/patterns/application-shell.html", "wide, compact, and phone shell composition reference"),
            ("desigh-system/components/navigation.html", "breadcrumbs and application navigation contracts"),
            ("desigh-system/components/tree.html", "keyboard-operable hierarchical navigation reference"),
            ("desigh-system/assets/components.css", "responsive `.rf-*` layout and scrolling contracts"),
            ("desigh-system/tests/smoke.spec.js", "390 px viewport overflow and page-load checks"),
        ],
    },
    "enforce-accessible-interaction": {
        "actor": "RepoFluent user",
        "actor_description": "Operates RepoFluent with a supported input method or assistive technology",
        "outcome": "provides semantic structure, deterministic focus, and perceivable asynchronous status",
        "assets": [
            ("desigh-system/foundations/accessibility.html", "keyboard, focus, naming, contrast, and reduced-motion guidance"),
            ("desigh-system/components/form-controls.html", "label, instruction, validation, and error-state contracts"),
            ("desigh-system/components/overlays-feedback.html", "dialog, callout, toast, and focus-restoration examples"),
            ("desigh-system/components/toolbars-tabs.html", "keyboard tab-selection and toolbar interaction examples"),
            ("desigh-system/assets/docs.js", "focus trapping, focus restoration, tab, tree, and announcement behaviors"),
        ],
    },
    "meet-performance-budgets": {
        "actor": "Platform operator",
        "actor_description": "Reviews learner-shell and interaction performance evidence",
        "outcome": "measures learner-shell and interaction budgets under an approved production profile",
        "assets": [
            ("desigh-system/tests/smoke.spec.js", "current reference-page load and narrow-viewport smoke coverage"),
            ("desigh-system/package.json", "pinned Playwright, validation, formatting, and test commands"),
            ("desigh-system/assets/tokens.css", "bounded motion durations and reduced-motion replacements"),
            ("frontend/package.json", "Angular 21 and TypeScript dependency baseline for the future application"),
            ("frontend/angular.json", "empty Angular workspace awaiting the production application project"),
        ],
    },
    "govern-browser-capabilities": {
        "actor": "RepoFluent user",
        "actor_description": "Uses RepoFluent through a supported or safely degraded browser",
        "outcome": "selects supported browser behavior and records safe capability fallback outcomes",
        "assets": [
            ("desigh-system/assets/tokens.css", "current `prefers-reduced-motion` fallback contract"),
            ("desigh-system/assets/docs.js", "progressive enhancement that leaves static content available"),
            ("desigh-system/foundations/motion.html", "motion and reduced-motion reference behavior"),
            ("desigh-system/foundations/accessibility.html", "browser-independent keyboard and semantic guidance"),
            ("desigh-system/tests/smoke.spec.js", "Chrome reference checks without a production support matrix"),
        ],
    },
}


SECTION_PATTERN = re.compile(
    r"^### (?P<id>L2-[A-Z]+-\d+)\s+[—-]\s+(?P<title>.+?)\n\n"
    r"\*\*Traces to:\*\*\s*(?P<traces>.+?)\n\n"
    r"(?P<body>.+?)\n\n\*\*Acceptance criteria\*\*",
    re.MULTILINE | re.DOTALL,
)


def parse_requirements(spec_file: Path) -> dict[str, Requirement]:
    text = spec_file.read_text(encoding="utf-8")
    requirements: dict[str, Requirement] = {}
    for match in SECTION_PATTERN.finditer(text):
        traces = match.group("traces").strip()
        primary_match = re.search(r"\bL1-[A-Z]+-\d+\b", traces)
        if primary_match is None:
            raise ValueError(f"{match.group('id')} has no L1 trace in {spec_file}")
        body = re.sub(r"\s+", " ", match.group("body")).strip()
        requirement = Requirement(
            identifier=match.group("id"),
            title=match.group("title").strip(),
            primary_l1=primary_match.group(0),
            text=body,
        )
        requirements[requirement.identifier] = requirement
    return requirements


def pascal_case(value: str) -> str:
    return "".join(part.capitalize() for part in re.findall(r"[A-Za-z0-9]+", value))


def puml_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', "\\\"")


def requirement_table(requirements: list[Requirement]) -> str:
    rows = [
        "| L2 ID | Refines (L1) | Requirement |",
        "|-------|--------------|-------------|",
    ]
    for requirement in requirements:
        text = requirement.text.replace("|", "\\|")
        rows.append(
            f"| `{requirement.identifier}` | `{requirement.primary_l1}` | {text} |"
        )
    return "\n".join(rows)


def readme_text(
    profile: Profile,
    feature_slug: str,
    title: str,
    requirements: list[Requirement],
) -> str:
    type_prefix = pascal_case(feature_slug)
    entry_type = f"{type_prefix}{profile.entry_suffix}"
    request_type = f"{type_prefix}Request"
    handler_type = f"{type_prefix}Handler"
    policy_type = f"{type_prefix}Policy"
    repository_type = f"I{type_prefix}Repository"
    record_type = f"{type_prefix}Record"
    controller_type = f"{type_prefix}Controller"
    covered_titles = ", ".join(f"*{item.title.lower()}*" for item in requirements)

    sequence_sections = []
    for requirement in requirements:
        sequence_name = f"sequence-{requirement.identifier.lower()}"
        sequence_sections.append(
            f"### Behaviour — {requirement.title.lower()}\n\n"
            f"The sequence applies `{requirement.identifier}` before the handler persists an accepted result. "
            "A rejected policy or validation result returns without a state change.\n\n"
            f"![Sequence diagram for {requirement.title.lower()}](diagrams/{sequence_name}.png)"
        )
    sequences = "\n\n".join(sequence_sections)

    return f"""# {title}

## Overview

RepoFluent's {profile.display_name} subsystem {profile.purpose}. This feature
brings {covered_titles} into one vertical slice. The slice preserves tenant,
actor, version, authorization, and correlation context wherever the cited
requirements apply.

The {profile.actor.lower()} starts the outcome through {profile.entry_name}.
{profile.api_name} applies server-side policy before state is read or changed.
The external dependency and persistent technology remain `<TO SUPPLY>` where
the requirements baseline does not select them.

## Description

The greenfield slice introduces the following building blocks. The endpoint
route, deployment topology, and unresolved provider choices remain `<TO SUPPLY>`.

- **`{entry_type}`** — {profile.entry_technology} entry component that presents
  the feature state and submits a typed intent.
- **`{profile.client_name}`** — typed client that carries tenant, actor, version,
  idempotency, and correlation context required by the operation.
- **`{controller_type}`** — {profile.api_technology} boundary that authenticates
  the caller, applies endpoint policy, and dispatches `{request_type}`.
- **`{request_type}`** — application request containing scope, actor, target,
  expected version, correlation identifier, and feature payload.
- **`{handler_type}`** — application handler that loads authorized state,
  invokes `{policy_type}`, and commits one result.
- **`{policy_type}`** — domain policy that evaluates the cited L2 rules without
  relying on client presentation state.
- **`{repository_type}`** — application abstraction for tenant-scoped reads,
  writes, optimistic concurrency, and idempotency lookup.
- **`{record_type}`** — persisted feature record containing identity, tenant,
  version, status, timestamps, and safe evidence references.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

{requirement_table(requirements)}

## Diagrams

### System context

The {profile.actor.lower()} uses RepoFluent to complete the feature outcome.
RepoFluent interacts with {profile.dependency_name} only through the boundary
described by the requirements and approved configuration.

![C4 system context for {title.lower()}](diagrams/c4-context.png)

### Containers

{profile.entry_name} sends typed requests to {profile.api_name}. The API applies
server-owned rules and records the accepted outcome in {profile.store_name}.

![C4 container view for {title.lower()}](diagrams/c4-container.png)

### Components

`{controller_type}` dispatches `{request_type}` to `{handler_type}`. The handler
uses `{policy_type}` and `{repository_type}` before it commits a state change.

![C4 component view for {title.lower()}](diagrams/c4-component.png)

### Class structure

`{handler_type}` depends on the request, policy, and repository abstractions.
`{repository_type}` stores `{record_type}` under tenant and version context.

![Class diagram for {title.lower()}](diagrams/class-structure.png)

{sequences}
"""


def c4_context(profile: Profile, title: str) -> str:
    return f"""@startuml
!include <C4/C4_Context>
LAYOUT_WITH_LEGEND()
title System Context — {puml_text(title)}

Person(actor, "{puml_text(profile.actor)}", "{puml_text(profile.actor_description)}")
System(repofluent, "RepoFluent", "Enterprise codebase learning platform")
System_Ext(dependency, "{puml_text(profile.dependency_name)}", "{puml_text(profile.dependency_description)}")

Rel(actor, repofluent, "Uses")
Rel(repofluent, dependency, "Uses through an approved boundary")
@enduml
"""


def c4_container(profile: Profile, title: str) -> str:
    return f"""@startuml
!include <C4/C4_Container>
LAYOUT_WITH_LEGEND()
title Containers — {puml_text(title)}

Person(actor, "{puml_text(profile.actor)}", "{puml_text(profile.actor_description)}")
System_Boundary(repofluent, "RepoFluent") {{
  Container(entry, "{puml_text(profile.entry_name)}", "{puml_text(profile.entry_technology)}", "{puml_text(profile.entry_description)}")
  Container(api, "{puml_text(profile.api_name)}", "{puml_text(profile.api_technology)}", "Applies application and domain policy")
  ContainerDb(store, "{puml_text(profile.store_name)}", "{puml_text(profile.store_technology)}", "Stores tenant-scoped state and evidence")
}}
System_Ext(dependency, "{puml_text(profile.dependency_name)}", "{puml_text(profile.dependency_description)}")

Rel(actor, entry, "Uses", "HTTPS or local invocation")
Rel(entry, api, "Sends typed requests", "JSON/HTTPS or local contract")
Rel(api, store, "Reads and writes", "Application abstraction")
Rel(api, dependency, "Calls through approved adapter")
@enduml
"""


def c4_component(profile: Profile, feature_slug: str, title: str) -> str:
    prefix = pascal_case(feature_slug)
    controller = f"{prefix}Controller"
    handler = f"{prefix}Handler"
    policy = f"{prefix}Policy"
    repository = f"I{prefix}Repository"
    return f"""@startuml
!include <C4/C4_Component>
LAYOUT_WITH_LEGEND()
title Components — {puml_text(title)}

Container_Boundary(api, "{puml_text(profile.api_name)}") {{
  Component(controller, "{controller}", "{puml_text(profile.api_technology)} boundary", "Authenticates, authorizes, and dispatches the request")
  Component(handler, "{handler}", "Application handler", "Coordinates one feature result")
  Component(policy, "{policy}", "Domain policy", "Enforces the cited L2 rules")
  Component(repository, "{repository}", "Application port", "Reads and writes tenant-scoped state")
  ComponentDb(store, "{puml_text(profile.store_name)}", "{puml_text(profile.store_technology)}", "Persists feature state and safe evidence")
}}

Rel(controller, handler, "Dispatches typed request")
Rel(handler, policy, "Evaluates")
Rel(handler, repository, "Loads and saves through")
Rel(repository, store, "Persists")
@enduml
"""


def class_structure(profile: Profile, feature_slug: str, title: str) -> str:
    prefix = pascal_case(feature_slug)
    request = f"{prefix}Request"
    handler = f"{prefix}Handler"
    policy = f"{prefix}Policy"
    repository = f"I{prefix}Repository"
    record = f"{prefix}Record"
    result = f"{prefix}Result"
    return f"""@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 8
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam class {{
  BorderColor #344054
  FontColor #101828
  BackgroundColor #F9FAFB
}}
title Class structure — {puml_text(title)}

class {request} {{
  +string ScopeId
  +string ActorId
  +string TargetId
  +long ExpectedVersion
  +string CorrelationId
  +object Payload
}}

class {result} {{
  +string Outcome
  +long Version
  +string SupportId
}}

class {record} {{
  +string Id
  +string TenantId
  +long Version
  +string Status
  +DateTimeOffset UpdatedAt
  +Apply(result: {result}): void
}}

class {policy} {{
  +Evaluate(request: {request}, current: {record}): {result}
}}

interface {repository} {{
  +Load(scopeId: string, targetId: string): Task<{record}>
  +Save(record: {record}, expectedVersion: long): Task
}}

class {handler} {{
  +Handle(request: {request}): Task<{result}>
}}

{handler} ..> {request} : handles
{handler} ..> {policy} : invokes
{handler} ..> {repository} : uses
{repository} --> {record} : loads / saves
{policy} ..> {record} : evaluates
{policy} ..> {result} : creates
{record} ..> {result} : applies
@enduml
"""


def sequence_diagram(
    profile: Profile,
    feature_slug: str,
    title: str,
    requirement: Requirement,
) -> str:
    prefix = pascal_case(feature_slug)
    entry = f"{prefix}{profile.entry_suffix}"
    controller = f"{prefix}Controller"
    handler = f"{prefix}Handler"
    policy = f"{prefix}Policy"
    repository = f"I{prefix}Repository"
    request = f"{prefix}Request"
    return f"""@startuml
title UML sequence behaviour — {puml_text(requirement.title)}
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 12
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam rectangle {{
  BorderColor #344054
  FontColor #101828
}}
skinparam package {{
  BorderColor #667085
  FontColor #101828
  BackgroundColor #F9FAFB
}}
actor "{puml_text(profile.actor)}" as actor
box "Frontend — {puml_text(profile.entry_name)}" #E0F2FE
  participant "{entry}" as entry
  participant "{puml_text(profile.client_name)}" as client
end box
box "Backend — {puml_text(profile.api_name)} application" #D1FADF
  participant "{controller}" as controller
end box
box "Backend — {puml_text(profile.display_name)} Application and Domain" #ECFDF3
  participant "{handler}" as handler
  participant "{policy}" as policy
end box
box "Backend — {puml_text(profile.display_name)} Infrastructure" #FFF4E5
  participant "{repository}" as repository
  database "{puml_text(profile.store_name)}" as store
end box
actor -> entry : Start {puml_text(title.lower())}
entry -> client : Build typed request
client -> controller : Send request with scope and correlation
controller -> controller : Authenticate and apply endpoint policy
controller -> handler : Dispatch {request}
handler -> repository : Load authorized current state
repository -> store : Read tenant-scoped record
store --> repository : Current record
repository --> handler : Authorized state
handler -> policy : Apply {requirement.identifier}
alt Policy and validation accept the request
  policy --> handler : Typed accepted result
  handler -> repository : Save with expected version and idempotency key
  repository -> store : Commit one result
  store --> repository : Durable version
  repository --> handler : Commit result
  handler --> controller : Typed feature result
else Policy or validation rejects the request
  policy --> handler : Typed rejection without mutation
  handler --> controller : Safe failure result
end
controller --> client : HTTP response or Problem Details
client --> entry : Typed outcome
entry --> actor : Present accessible feature state
@enduml
"""


def experience_readme(
    feature_slug: str,
    title: str,
    requirements: list[Requirement],
) -> str:
    design = EXPERIENCE_DESIGNS[feature_slug]
    covered_titles = ", ".join(f"*{item.title.lower()}*" for item in requirements)
    assets = "\n".join(
        f"- **`{path}`** — {description}." for path, description in design["assets"]
    )
    sequence_sections = []
    for requirement in requirements:
        sequence_sections.append(
            f"### Behaviour — {requirement.title.lower()}\n\n"
            f"The reference assets apply `{requirement.identifier}` through a semantic "
            "contract and an accessible fallback. The conformance suite checks the "
            "available reference behavior before the contract is consumed by the "
            "production application.\n\n"
            f"![Sequence diagram for {requirement.title.lower()}]"
            f"(diagrams/sequence-{requirement.identifier.lower()}.png)"
        )
    sequences = "\n\n".join(sequence_sections)

    return f"""# {title}

## Overview

RepoFluent's Experience Platform subsystem provides design-system,
accessibility, responsive, capability, and performance foundations. This
feature {design['outcome']}. It covers {covered_titles}.

The checked-in reference implementation is the static `desigh-system/` site.
Its HTML, CSS, and JavaScript work from `file://` without a runtime dependency.
The production Angular consumer, telemetry integration, supported-browser
matrix, and production measurement profile remain `<TO SUPPLY>`.

## Description

The feature uses the following checked-in assets and planned integration seam.

{assets}
- **`ExperiencePlatformAdapter`** — planned Angular library boundary that maps
  the accepted `.rf-*` contracts into product components; implementation remains
  `<TO SUPPLY>` because `frontend/angular.json` contains no application project.
- **`ExperienceConformanceSuite`** — quality boundary composed from Playwright,
  `html-validate`, Prettier, accessibility checks, and production performance
  gates. Production performance and browser-matrix checks remain `<TO SUPPLY>`.

The structural diagram models source artifacts as typed contracts. It does not
claim that the current static JavaScript defines application classes.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

{requirement_table(requirements)}

## Diagrams

### System context

The {design['actor'].lower()} uses RepoFluent through the browser platform. The
design-system reference defines the interaction contract consumed by the
planned Angular application.

![C4 system context for {title.lower()}](diagrams/c4-context.png)

### Containers

The static reference site reads the checked-in contract source directly. The
quality tooling validates the same pages and assets before product integration.

![C4 container view for {title.lower()}](diagrams/c4-container.png)

### Components

`assets/tokens.css`, `assets/components.css`, the reference pages, and
`assets/docs.js` form the current contract. `tests/smoke.spec.js` exercises the
rendered reference behavior.

![C4 component view for {title.lower()}](diagrams/c4-component.png)

### Class structure

The model represents CSS, HTML, JavaScript, and conformance assets as typed
contracts. `ExperiencePlatformAdapter` is the planned production consumer.

![Class diagram for {title.lower()}](diagrams/class-structure.png)

{sequences}
"""


def experience_c4_context(feature_slug: str, title: str) -> str:
    design = EXPERIENCE_DESIGNS[feature_slug]
    return f"""@startuml
!include <C4/C4_Context>
LAYOUT_WITH_LEGEND()
title System Context — {puml_text(title)}

Person(actor, "{puml_text(design['actor'])}", "{puml_text(design['actor_description'])}")
System(repofluent, "RepoFluent", "Enterprise codebase learning platform")
System(design_reference, "RepoFluent design-system reference", "Static HTML, CSS, and JavaScript interaction contract")
System_Ext(browser, "Browser platform", "Renders semantic content and optional capabilities")

Rel(actor, repofluent, "Uses")
Rel(repofluent, design_reference, "Consumes accepted interaction contracts from")
Rel(repofluent, browser, "Runs within")
@enduml
"""


def experience_c4_container(feature_slug: str, title: str) -> str:
    design = EXPERIENCE_DESIGNS[feature_slug]
    return f"""@startuml
!include <C4/C4_Container>
LAYOUT_WITH_LEGEND()
title Containers — {puml_text(title)}

Person(actor, "{puml_text(design['actor'])}", "{puml_text(design['actor_description'])}")
System_Boundary(repofluent, "RepoFluent Experience Platform") {{
  Container(reference, "Design-system reference", "Static HTML/CSS/JavaScript", "Documents and demonstrates accepted interaction contracts")
  Container(application, "RepoFluent web application", "Angular 21 — <TO SUPPLY>", "Consumes accepted product-facing contracts")
  Container(quality, "Experience conformance tooling", "Playwright, html-validate, Prettier", "Checks reference behavior and source quality")
  ContainerDb(source, "Design-system source", "Repository files", "Stores tokens, component CSS, pages, scripts, and tests")
}}
System_Ext(browser, "Browser platform", "Renders semantic content and capability fallbacks")

Rel(actor, reference, "Reviews or operates", "file:// or HTTP")
Rel(reference, source, "Loads")
Rel(application, source, "Consumes accepted .rf-* contracts from")
Rel(quality, source, "Validates")
Rel(reference, browser, "Runs within")
Rel(application, browser, "Runs within")
@enduml
"""


def experience_c4_component(title: str) -> str:
    return f"""@startuml
!include <C4/C4_Component>
LAYOUT_WITH_LEGEND()
title Components — {puml_text(title)}

Container_Boundary(reference, "Design-system reference") {{
  Component(tokens, "assets/tokens.css", "CSS contract", "Defines authoritative --rf-* semantic tokens")
  Component(components, "assets/components.css", "CSS contract", "Defines reusable product-facing .rf-* classes")
  Component(pages, "foundations/, components/, patterns/", "Static HTML", "Documents foundations and reference states")
  Component(runtime, "assets/docs.js", "JavaScript", "Adds navigation and progressive example behavior")
  Component(tests, "tests/smoke.spec.js", "Playwright", "Checks page loading, keyboard behavior, focus, and narrow layout")
}}

Rel(pages, tokens, "Uses")
Rel(pages, components, "Uses")
Rel(pages, runtime, "Enhances through")
Rel(tests, pages, "Exercises in Chrome")
@enduml
"""


def experience_class_structure(title: str) -> str:
    return f"""@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 8
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam class {{
  BorderColor #344054
  FontColor #101828
  BackgroundColor #F9FAFB
}}
title Class structure — {puml_text(title)}

class "assets/tokens.css" as TokenContract <<CSS contract>> {{
  +string SemanticColorTokens
  +string TypographyTokens
  +string SpacingAndSizingTokens
  +duration MotionTokens
  +ApplyReducedMotion(preference: MediaQuery): void
}}

class "assets/components.css" as ComponentContract <<CSS contract>> {{
  +string ProductClassPrefix = ".rf-"
  +DefineStates(component: string): StateSet
  +ApplyResponsiveLayout(profile: ViewportProfile): void
}}

class "reference HTML pages" as ReferencePage <<HTML contract>> {{
  +string Category
  +string PageId
  +RenderSemanticExample(): HTMLElement
}}

class "assets/docs.js" as DocumentationRuntime <<JavaScript module>> {{
  +RegisterNavigation(): void
  +RegisterKeyboardPatterns(): void
  +RestoreDialogFocus(): void
  +SynchronizeGraphSelection(): void
}}

class ExperiencePlatformAdapter <<planned Angular library>> {{
  +MapTokens(contract: TokenContract): Theme
  +CreateComponent(contract: ComponentContract): Component
  +SelectFallback(capabilities: CapabilitySet): Presentation
}}

class ExperienceConformanceSuite <<quality boundary>> {{
  +ValidateHtml(): Result
  +RunSmokeTests(): Result
  +MeasurePerformance(profile: MeasurementProfile): Result
}}

ReferencePage ..> TokenContract : uses
ReferencePage ..> ComponentContract : uses
DocumentationRuntime ..> ReferencePage : enhances
ExperiencePlatformAdapter ..> TokenContract : consumes
ExperiencePlatformAdapter ..> ComponentContract : consumes
ExperienceConformanceSuite ..> ReferencePage : verifies
ExperienceConformanceSuite ..> ExperiencePlatformAdapter : verifies when supplied
@enduml
"""


def experience_sequence(
    feature_slug: str,
    title: str,
    requirement: Requirement,
) -> str:
    design = EXPERIENCE_DESIGNS[feature_slug]
    return f"""@startuml
title UML sequence behaviour — {puml_text(requirement.title)}
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 12
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam rectangle {{
  BorderColor #344054
  FontColor #101828
}}
skinparam package {{
  BorderColor #667085
  FontColor #101828
  BackgroundColor #F9FAFB
}}
actor "{puml_text(design['actor'])}" as actor
box "Frontend — Design-system reference" #E0F2FE
  participant "ReferencePage" as page
  participant "BrowserRuntime" as browser
end box
box "Backend — Experience quality tooling" #D1FADF
  participant "ExperienceConformanceSuite" as suite
end box
box "Backend — Experience contract" #ECFDF3
  participant "TokenContract" as tokens
  participant "ComponentContract" as components
end box
box "Backend — Repository infrastructure" #FFF4E5
  database "Design-system source files" as files
end box
actor -> page : Open {puml_text(title.lower())} reference
page -> files : Load semantic HTML and .rf-* assets
files --> page : Versioned reference assets
page -> browser : Initialize progressive enhancement
browser -> tokens : Apply {requirement.identifier} token and capability policy
tokens --> browser : Semantic values and fallback
browser -> components : Apply component state and interaction contract
alt Capability and interaction are supported
  components --> browser : Enhanced accessible presentation
else Capability is unavailable or reduced
  components --> browser : Semantic fallback presentation
end
browser --> page : Rendered state
page --> actor : Perceivable and operable outcome
opt Conformance gate
  suite -> files : Read the same source assets
  files --> suite : HTML, CSS, JavaScript, and test sources
  suite -> page : Exercise reference behavior for {requirement.identifier}
  page --> suite : Observable result
end
@enduml
"""


def write_experience_feature(
    subsystem: str,
    feature_slug: str,
    title: str,
    requirements: list[Requirement],
) -> tuple[int, int]:
    feature_root = DESIGNS_ROOT / subsystem / feature_slug
    diagrams_root = feature_root / "diagrams"
    diagrams_root.mkdir(parents=True, exist_ok=True)
    (feature_root / "README.md").write_text(
        experience_readme(feature_slug, title, requirements),
        encoding="utf-8",
        newline="\n",
    )
    diagrams = {
        "c4-context.puml": experience_c4_context(feature_slug, title),
        "c4-container.puml": experience_c4_container(feature_slug, title),
        "c4-component.puml": experience_c4_component(title),
        "class-structure.puml": experience_class_structure(title),
    }
    for requirement in requirements:
        diagrams[f"sequence-{requirement.identifier.lower()}.puml"] = experience_sequence(
            feature_slug, title, requirement
        )
    for name, content in diagrams.items():
        (diagrams_root / name).write_text(content, encoding="utf-8", newline="\n")
    return 1, len(diagrams)


def write_feature(
    subsystem: str,
    profile: Profile,
    feature_slug: str,
    title: str,
    requirements: list[Requirement],
) -> tuple[int, int]:
    if subsystem == "10-experience-platform":
        return write_experience_feature(
            subsystem, feature_slug, title, requirements
        )
    feature_root = DESIGNS_ROOT / subsystem / feature_slug
    diagrams_root = feature_root / "diagrams"
    diagrams_root.mkdir(parents=True, exist_ok=True)

    (feature_root / "README.md").write_text(
        readme_text(profile, feature_slug, title, requirements),
        encoding="utf-8",
        newline="\n",
    )
    diagrams = {
        "c4-context.puml": c4_context(profile, title),
        "c4-container.puml": c4_container(profile, title),
        "c4-component.puml": c4_component(profile, feature_slug, title),
        "class-structure.puml": class_structure(profile, feature_slug, title),
    }
    for requirement in requirements:
        diagrams[f"sequence-{requirement.identifier.lower()}.puml"] = sequence_diagram(
            profile, feature_slug, title, requirement
        )
    for name, content in diagrams.items():
        (diagrams_root / name).write_text(content, encoding="utf-8", newline="\n")
    return 1, len(diagrams)


def write_index() -> None:
    lines = [
        "# RepoFluent detailed designs",
        "",
        "The detailed-design tree refines the L2 requirements in `docs/specs/` into",
        "vertical feature slices. Each feature page contains an overview, concrete",
        "building blocks, exact L2-to-L1 traceability, and rendered C4 and UML",
        "diagrams with their PlantUML sources.",
        "",
        "Unresolved technology, provider, scale, and deployment decisions remain",
        "marked `<TO SUPPLY>` until the corresponding product or architecture decision",
        "is approved.",
        "",
        "## Subsystems",
        "",
    ]
    for subsystem in sorted(FEATURES):
        profile = PROFILES[subsystem]
        lines.extend([f"### {profile.display_name}", ""])
        for feature_slug, title, _ in FEATURES[subsystem]:
            lines.append(f"- [{title}]({subsystem}/{feature_slug}/)")
        lines.append("")
    (DESIGNS_ROOT / "README.md").write_text(
        "\n".join(lines), encoding="utf-8", newline="\n"
    )


def main() -> None:
    if not SPECS_ROOT.is_dir():
        raise SystemExit("docs/specs is missing")

    all_parsed: dict[str, dict[str, Requirement]] = {}
    for subsystem in sorted(PROFILES):
        spec_file = SPECS_ROOT / subsystem / "L2.md"
        if not spec_file.is_file():
            raise SystemExit(f"missing {spec_file.relative_to(ROOT)}")
        parsed = parse_requirements(spec_file)
        if not parsed:
            raise SystemExit(f"no L2 requirements parsed from {spec_file.relative_to(ROOT)}")
        all_parsed[subsystem] = parsed

    mapped_ids: list[str] = []
    for subsystem, features in FEATURES.items():
        for _, _, identifiers in features:
            mapped_ids.extend(identifiers)
            unknown = set(identifiers) - set(all_parsed[subsystem])
            if unknown:
                raise SystemExit(f"unknown requirement IDs for {subsystem}: {sorted(unknown)}")

    duplicates = sorted({item for item in mapped_ids if mapped_ids.count(item) > 1})
    if duplicates:
        raise SystemExit(f"requirements mapped more than once: {duplicates}")

    parsed_ids = {item for parsed in all_parsed.values() for item in parsed}
    mapped_set = set(mapped_ids)
    if parsed_ids != mapped_set:
        missing = sorted(parsed_ids - mapped_set)
        extra = sorted(mapped_set - parsed_ids)
        raise SystemExit(f"feature map mismatch; missing={missing}, extra={extra}")

    feature_count = 0
    diagram_count = 0
    for subsystem in sorted(FEATURES):
        profile = PROFILES[subsystem]
        for feature_slug, title, identifiers in FEATURES[subsystem]:
            requirements = [all_parsed[subsystem][item] for item in identifiers]
            features_written, diagrams_written = write_feature(
                subsystem, profile, feature_slug, title, requirements
            )
            feature_count += features_written
            diagram_count += diagrams_written

    write_index()

    print(
        f"Generated {feature_count} feature designs, {diagram_count} PlantUML sources, "
        f"and mapped {len(mapped_ids)} L2 requirements exactly once."
    )


if __name__ == "__main__":
    main()
