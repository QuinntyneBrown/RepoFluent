#!/usr/bin/env python3
"""Generate RepoFluent platform and subsystem high-level designs.

The architecture map is curated. The generator keeps the thirteen design pages,
their PlantUML sources, and the subsystem index synchronized while production
provider decisions remain explicit gaps in the documents.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DESIGNS_ROOT = ROOT / "docs" / "high-level-designs"


@dataclass(frozen=True)
class Component:
    alias: str
    name: str
    technology: str
    responsibility: str
    state: str


@dataclass(frozen=True)
class Store:
    alias: str
    name: str
    technology: str
    responsibility: str
    record_group: str


@dataclass(frozen=True)
class External:
    alias: str
    name: str
    responsibility: str


@dataclass(frozen=True)
class SequenceParticipant:
    kind: str
    alias: str
    label: str


@dataclass(frozen=True)
class Subsystem:
    slug: str
    title: str
    acronym: str
    actor: str
    actor_description: str
    purpose: str
    boundary: str
    definitions: tuple[tuple[str, str], ...]
    frontend: tuple[Component, ...]
    api: tuple[Component, ...]
    worker: tuple[Component, ...]
    tool: tuple[Component, ...]
    stores: tuple[Store, ...]
    externals: tuple[External, ...]
    relations: tuple[tuple[str, str, str, str], ...]
    information_notes: tuple[str, ...]
    collaborations: tuple[str, ...]
    decisions: tuple[str, ...]
    implementation_status: str
    classes: tuple[tuple[str, tuple[str, ...]], ...]
    class_relations: tuple[str, ...]
    sequence_name: str
    sequence_frontend: tuple[SequenceParticipant, ...]
    sequence_api: tuple[SequenceParticipant, ...]
    sequence_domain: tuple[SequenceParticipant, ...]
    sequence_infrastructure: tuple[SequenceParticipant, ...]
    sequence_steps: tuple[str, ...]


def c(alias: str, name: str, technology: str, responsibility: str, state: str) -> Component:
    return Component(alias, name, technology, responsibility, state)


def s(alias: str, name: str, technology: str, responsibility: str, record_group: str) -> Store:
    return Store(alias, name, technology, responsibility, record_group)


def x(alias: str, name: str, responsibility: str) -> External:
    return External(alias, name, responsibility)


def p(kind: str, alias: str, label: str) -> SequenceParticipant:
    return SequenceParticipant(kind, alias, label)


SUBSYSTEMS = (
    Subsystem(
        slug="01-identity-tenancy-access",
        title="Identity, Tenancy, and Access",
        acronym="ITA",
        actor="Tenant administrator",
        actor_description="Administers identities, groups, roles, and access policy",
        purpose="establishes the authenticated actor and tenant-scoped authorization context used by every RepoFluent operation",
        boundary="The subsystem owns tenants, users, groups, memberships, role grants, invitations, sessions, policy evaluation, provisioning adapters, and identity audit evidence. Domain permissions remain defined by the subsystem that owns each protected resource.",
        definitions=(
            ("tenant", "security and data-isolation boundary for one customer organization"),
            ("actor context", "server-derived tenant, user, role, group, and resource-scope facts attached to one operation"),
            ("resource scope", "constraint that limits a role grant to named teams, curricula, systems, or repository classifications"),
        ),
        frontend=(
            c("identity_ui", "Identity Administration Workspace", "Angular 21", "Presents invitations, users, groups, roles, sessions, and access reviews", "Target platform"),
        ),
        api=(
            c("identity_endpoints", "IdentityEndpoints", "ASP.NET Core", "Exposes tenant-scoped identity administration and sign-in callbacks", "Target platform"),
            c("actor_context", "ActorContextResolver", ".NET application service", "Builds trusted actor context from server-side identity data", "Foundation implemented"),
            c("policy_engine", "AuthorizationPolicyEvaluator", ".NET domain service", "Evaluates action, tenant, role, group, and resource constraints", "Target platform"),
        ),
        worker=(
            c("provisioning_worker", "ProvisioningProcessor", ".NET worker", "Applies idempotent user and group provisioning changes", "Target platform"),
            c("access_review_worker", "AccessReviewScheduler", ".NET worker", "Creates periodic review snapshots and revocation tasks", "Target platform"),
        ),
        tool=(),
        stores=(
            s("identity_store", "Identity schema", "Production relational database <TO SUPPLY>", "Stores tenants, users, groups, grants, invitations, and sessions", "Identity state"),
            s("identity_audit", "Audit ledger", "Append-only relational or ledger storage <TO SUPPLY>", "Stores attributable identity and access events", "Identity audit evidence"),
        ),
        externals=(
            x("idp", "Enterprise identity provider", "Authenticates production users and supplies approved identity claims"),
        ),
        relations=(
            ("actor", "identity_ui", "Administers tenant access using", "HTTPS"),
            ("identity_ui", "identity_endpoints", "Calls", "JSON/HTTPS"),
            ("identity_endpoints", "actor_context", "Requests trusted actor context from", "in process"),
            ("actor_context", "policy_engine", "Supplies identity facts to", "in process"),
            ("policy_engine", "identity_store", "Reads grants and resource scopes from", "SQL"),
            ("identity_endpoints", "identity_store", "Reads and writes identities in", "SQL"),
            ("identity_endpoints", "identity_audit", "Appends access changes to", "transactional outbox"),
            ("provisioning_worker", "idp", "Receives approved provisioning changes from", "standard <TO SUPPLY>"),
            ("provisioning_worker", "identity_store", "Applies idempotent changes to", "SQL"),
            ("access_review_worker", "identity_store", "Reads grants and records review state in", "SQL"),
            ("identity_endpoints", "idp", "Completes sign-in with", "OIDC or SAML <TO SUPPLY>"),
        ),
        information_notes=(
            "The identity schema is authoritative for RepoFluent tenant membership and authorization grants.",
            "The enterprise identity provider remains authoritative for external authentication and selected directory attributes.",
            "Every persisted identity record carries a platform-generated tenant identifier; client-supplied tenant identifiers never establish access.",
        ),
        collaborations=(
            "Every API module consumes `ActorContext` and the central policy evaluator before protected state is read.",
            "Administration coordinates user and group workflows through this subsystem rather than writing identity tables directly.",
            "Security owns cross-platform control policy; Observability owns redacted authentication and authorization telemetry.",
        ),
        decisions=(
            "Production identity provider, federation protocol, and provisioning protocol — `<TO SUPPLY>`.",
            "Session transport, token lifetime, revocation propagation, and step-up authentication policy — `<TO SUPPLY>`.",
            "The current development persona scheme remains confined to Development, Testing, and E2E environments.",
        ),
        implementation_status="`DevelopmentAuthenticationHandler`, `DevelopmentUserDirectory`, and `ActorContext` provide bounded evidence for the current vertical slice. Production federation, session storage, provisioning, and access-review components remain target architecture.",
        classes=(
            ("Tenant", ("+Guid Id", "+string Name", "+TenantStatus Status", "+ChangeStatus(status): void")),
            ("User", ("+Guid Id", "+Guid TenantId", "+string ExternalSubject", "+UserStatus Status", "+Deactivate(): void")),
            ("Group", ("+Guid Id", "+Guid TenantId", "+string Name", "+AddMember(userId): void")),
            ("Membership", ("+Guid GroupId", "+Guid UserId", "+DateTimeOffset EffectiveAt")),
            ("RoleGrant", ("+Guid Id", "+Guid UserId", "+Role Role", "+ResourceScope Scope", "+Revoke(): void")),
            ("ActorContext", ("+Guid TenantId", "+Guid UserId", "+IReadOnlySet<Role> Roles", "+Authorize(action, resource): Decision")),
            ("IdentityAuditEvent", ("+Guid Id", "+Guid TenantId", "+Guid ActorId", "+string Action", "+DateTimeOffset OccurredAt")),
        ),
        class_relations=(
            'Tenant "1" *-- "*" User : contains',
            'Tenant "1" *-- "*" Group : contains',
            'Group "1" *-- "*" Membership : owns',
            'Membership "*" --> "1" User : references',
            'User "1" *-- "*" RoleGrant : receives',
            'RoleGrant --> ActorContext : contributes to',
            'ActorContext ..> IdentityAuditEvent : attributes',
        ),
        sequence_name="authenticate-and-authorize",
        sequence_frontend=(p("participant", "shell", "RepoFluent application shell"), p("participant", "client", "IdentityApiClient")),
        sequence_api=(p("participant", "auth", "Authentication middleware"), p("participant", "endpoint", "Protected endpoint")),
        sequence_domain=(p("participant", "resolver", "ActorContextResolver"), p("participant", "policy", "AuthorizationPolicyEvaluator")),
        sequence_infrastructure=(p("participant", "provider", "Enterprise identity provider"), p("database", "store", "Identity schema"), p("database", "audit", "Audit ledger")),
        sequence_steps=(
            "actor -> shell : Start an authorized task",
            "shell -> provider : Redirect for production sign-in",
            "provider --> shell : Return authenticated session result",
            "shell -> client : Request protected operation",
            "client -> auth : Send HTTPS request and session credential",
            "auth -> provider : Validate credential when required",
            "provider --> auth : Validated subject and approved claims",
            "auth -> resolver : Resolve server-side tenant and grants",
            "resolver -> store : Read active identity and grants",
            "store --> resolver : Tenant-scoped identity state",
            "resolver --> auth : Trusted ActorContext",
            "auth -> endpoint : Continue authenticated request",
            "endpoint -> policy : Evaluate action and resource scope",
            "policy --> endpoint : Permit or deny",
            "endpoint -> audit : Append decision evidence",
            "audit --> endpoint : Commit result",
            "endpoint --> client : Result or non-disclosing problem",
            "client --> shell : Present authorized result",
            "shell --> actor : Complete task",
        ),
    ),
    Subsystem(
        slug="02-curriculum-input-contract",
        title="Curriculum Input Contract",
        acronym="CIC",
        actor="Contract maintainer",
        actor_description="Publishes schema, ICD, fixtures, and compatibility policy",
        purpose="defines the portable and versioned exchange boundary between content-producing agents and RepoFluent",
        boundary="The subsystem owns the JSON Schema, Interface Control Document, canonical formats, stable validation vocabulary, compatibility rules, extension mechanism, and conformance fixtures. It does not run agents, import tenant drafts, or render learner content.",
        definitions=(
            ("contract release", "immutable set of schema, ICD, fixtures, compatibility metadata, and checksums for one version"),
            ("curriculum package", "portable JSON document that describes source provenance, architecture, learning content, code references, and assessments"),
            ("validation issue", "stable code, severity, JSON Pointer, and safe explanation produced by contract validation"),
        ),
        frontend=(),
        api=(
            c("registry_endpoint", "ContractRegistryEndpoint", "ASP.NET Core", "Returns supported releases and checksummed contract artifacts", "Target platform"),
            c("compatibility_policy", "ContractCompatibilityPolicy", ".NET application service", "Determines accepted versions and migration guidance", "Target platform"),
        ),
        worker=(),
        tool=(
            c("contract_cli", "RepoFluent.ContractCli", ".NET tool", "Validates packages locally and emits human or machine output", "Target executable"),
            c("validator", "CurriculumPackageValidator", "Shared .NET library", "Applies structural and semantic contract rules deterministically", "Foundation implemented"),
            c("release_verifier", "ContractReleaseVerifier", "Build pipeline tool", "Checks schema, ICD, fixtures, compatibility metadata, and checksums", "Target delivery tool"),
        ),
        stores=(
            s("artifact_store", "Contract artifact registry", "Versioned object or package storage <TO SUPPLY>", "Publishes immutable release bundles", "Contract releases"),
        ),
        externals=(),
        relations=(
            ("actor", "release_verifier", "Builds and verifies releases with", "delivery pipeline"),
            ("release_verifier", "validator", "Runs conformance fixtures through", "in process"),
            ("release_verifier", "artifact_store", "Publishes checksummed release to", "artifact protocol <TO SUPPLY>"),
            ("registry_endpoint", "artifact_store", "Reads supported releases from", "artifact API"),
            ("registry_endpoint", "compatibility_policy", "Applies", "in process"),
            ("contract_cli", "artifact_store", "Downloads an explicitly selected release from", "HTTPS"),
            ("contract_cli", "validator", "Validates local package with", "in process"),
        ),
        information_notes=(
            "The repository path `contracts/curriculum/{version}` is the source representation for contract releases.",
            "The artifact registry distributes immutable copies identified by semantic version and checksum.",
            "Validation output excludes secret-like values and unnecessary source excerpts.",
        ),
        collaborations=(
            "The Agent Authoring Kit embeds or pins one compatible contract release.",
            "Curriculum Lifecycle calls the same validator library used by the local CLI.",
            "Code Navigation and Assessment contribute contract semantics for source and protected-answer structures.",
        ),
        decisions=(
            "Artifact registry and public or tenant-authenticated distribution mechanism — `<TO SUPPLY>`.",
            "Supported-version window, package limits, locales, and allowed media types — `<TO SUPPLY>`.",
            "Contract evolution remains additive within a major version unless an approved migration accompanies a breaking release.",
        ),
        implementation_status="Contract `0.1.0`, its JSON Schema, release notes, and an order-processing fixture exist. `PackageValidator` implements the current vertical-slice subset. The distributable CLI and release registry remain target components.",
        classes=(
            ("ContractRelease", ("+SemVer Version", "+Checksum Checksum", "+CompatibilityRange SupportedBy", "+Verify(): ReleaseResult")),
            ("CurriculumPackage", ("+string PackageId", "+SemVer ContractVersion", "+PackageMetadata Metadata", "+Validate(release): IssueSet")),
            ("SourceSnapshot", ("+string Repository", "+string Revision", "+DateTimeOffset CapturedAt")),
            ("CourseDefinition", ("+string Id", "+string Title", "+Duration EstimatedDuration")),
            ("CodeReference", ("+string RepositoryRelativePath", "+string? Symbol", "+LineRange? Lines")),
            ("AssessmentDefinition", ("+string Id", "+AttemptPolicy Policy", "+IReadOnlyList<Question> Questions")),
            ("ValidationIssue", ("+string Code", "+IssueSeverity Severity", "+JsonPointer Path", "+string SafeMessage")),
        ),
        class_relations=(
            'ContractRelease ..> CurriculumPackage : validates',
            'CurriculumPackage "1" *-- "1" SourceSnapshot : identifies',
            'CurriculumPackage "1" *-- "*" CourseDefinition : contains',
            'CourseDefinition "1" o-- "*" CodeReference : cites',
            'CourseDefinition "1" o-- "*" AssessmentDefinition : includes',
            'CurriculumPackage ..> ValidationIssue : produces',
        ),
        sequence_name="release-and-consume-contract",
        sequence_frontend=(p("participant", "workbench", "Contract release workbench"), p("participant", "cli", "RepoFluent.ContractCli")),
        sequence_api=(p("participant", "registry", "ContractRegistryEndpoint"),),
        sequence_domain=(p("participant", "verifier", "ContractReleaseVerifier"), p("participant", "validator", "CurriculumPackageValidator")),
        sequence_infrastructure=(p("database", "repo", "Contract source tree"), p("database", "artifacts", "Contract artifact registry")),
        sequence_steps=(
            "actor -> workbench : Prepare schema, ICD, fixtures, and metadata",
            "workbench -> verifier : Build candidate contract release",
            "verifier -> repo : Read versioned source artifacts",
            "repo --> verifier : Candidate release",
            "verifier -> validator : Run valid and invalid fixtures",
            "validator --> verifier : Deterministic conformance results",
            "alt release conforms",
            "  verifier -> artifacts : Publish immutable bundle and checksum",
            "  artifacts --> verifier : Release identifier",
            "else release fails",
            "  verifier --> workbench : Return blocking release issues",
            "end",
            "cli -> registry : Request selected contract version",
            "registry -> artifacts : Read verified bundle",
            "artifacts --> registry : Schema, ICD, fixtures, and checksum",
            "registry --> cli : Checksummed contract release",
            "cli -> validator : Validate local curriculum package",
            "validator --> cli : Stable issues and exit status",
        ),
    ),
    Subsystem(
        slug="03-agent-authoring-kit",
        title="Agent Authoring Kit",
        acronym="AAK",
        actor="Curriculum authoring agent",
        actor_description="Analyzes approved source material within a customer-controlled environment",
        purpose="packages the guidance and tools that produce a locally validated curriculum package from approved repositories and documents",
        boundary="The subsystem owns `AGENTS.md`, reusable prompts, `SKILL.md` files, ecosystem guidance, examples, local validation integration, and the generation manifest. Customer repository access, model selection, and agent execution remain outside RepoFluent MVP hosting.",
        definitions=(
            ("authoring kit", "immutable release bundle containing agent guidance, prompts, skills, contract artifacts, examples, and validator tooling"),
            ("source scope", "declared repositories, documents, revisions, inclusions, and exclusions available to one generation run"),
            ("generation manifest", "non-reasoning record of tool identity, source snapshot, timestamps, compatibility versions, and package checksum"),
        ),
        frontend=(),
        api=(
            c("kit_endpoint", "AuthoringKitDownloadEndpoint", "ASP.NET Core", "Lists compatible kit releases and returns signed download references", "Target platform"),
        ),
        worker=(),
        tool=(
            c("agent_guidance", "Agent Guidance Bundle", "Markdown and templates", "Constrains scope, provenance, uncertainty, secrets, and identifier behavior", "Target artifact"),
            c("authoring_orchestrator", "Authoring Orchestrator", "Customer-selected agent", "Analyzes approved material and assembles a package", "Customer environment"),
            c("local_validator", "RepoFluent.ContractCli", ".NET tool", "Validates generated bytes before they leave the approved environment", "Target executable"),
            c("manifest_writer", "GenerationManifestWriter", "Kit utility", "Records reproducible non-reasoning generation metadata", "Target tool"),
        ),
        stores=(
            s("kit_registry", "Authoring kit registry", "Versioned artifact storage <TO SUPPLY>", "Stores immutable signed kit releases", "Kit releases"),
            s("workspace", "Approved authoring workspace", "Customer-controlled file system", "Holds approved sources and generated output", "Customer source and generated package"),
        ),
        externals=(
            x("sources", "Approved repositories and documents", "Provide the declared source snapshot under customer access policy"),
            x("agent_runtime", "Customer-selected agent runtime", "Executes the kit instructions inside the approved environment"),
        ),
        relations=(
            ("actor", "authoring_orchestrator", "Runs as", "agent runtime"),
            ("kit_endpoint", "kit_registry", "Reads immutable kit releases from", "artifact API"),
            ("authoring_orchestrator", "kit_endpoint", "Downloads compatible kit from", "HTTPS"),
            ("authoring_orchestrator", "agent_guidance", "Follows", "local files"),
            ("authoring_orchestrator", "sources", "Reads declared snapshot from", "customer-controlled access"),
            ("authoring_orchestrator", "workspace", "Writes generated package to", "file system"),
            ("manifest_writer", "workspace", "Writes manifest and checksum to", "file system"),
            ("local_validator", "workspace", "Reads and validates package in", "file system"),
            ("authoring_orchestrator", "agent_runtime", "Executes within", "provider-specific"),
        ),
        information_notes=(
            "The kit registry is authoritative for immutable kit releases and their compatible contract versions.",
            "The approved authoring workspace remains authoritative for customer source access and generated bytes before upload.",
            "RepoFluent receives no source, prompt, or package content during local generation unless an authorized author later uploads the result.",
        ),
        collaborations=(
            "Curriculum Input Contract supplies the schema, ICD, fixtures, and validator behavior embedded by the kit.",
            "Curriculum Lifecycle receives the validated package only after an author initiates upload.",
            "Security supplies scope, secret-handling, data-use, and source-minimization guidance.",
        ),
        decisions=(
            "First supported agent hosts, packaging format, signing mechanism, and installation channel — `<TO SUPPLY>`.",
            "Managed agent execution remains outside the target runtime until a separate security and deployment decision is approved.",
            "C# and Angular guidance forms the first ecosystem profile; additional profiles remain additive kit modules.",
        ),
        implementation_status="The requirements and detailed designs define the bundle. The repository does not yet contain a released authoring kit or `RepoFluent.ContractCli` executable.",
        classes=(
            ("AuthoringKitRelease", ("+SemVer Version", "+SemVer ContractVersion", "+Checksum Checksum", "+VerifySignature(): bool")),
            ("SourceScope", ("+IReadOnlyList<SourceRef> Includes", "+IReadOnlyList<Pattern> Excludes", "+Validate(): ScopeResult")),
            ("AgentInstruction", ("+string Path", "+InstructionKind Kind", "+int Precedence")),
            ("SkillDefinition", ("+string Name", "+string EntryPath", "+IReadOnlyList<string> Resources")),
            ("GenerationRun", ("+Guid Id", "+DateTimeOffset StartedAt", "+Generate(scope): GeneratedPackage")),
            ("GenerationManifest", ("+string ToolIdentity", "+SourceSnapshot Snapshot", "+Checksum PackageChecksum")),
            ("LocalValidationResult", ("+bool IsValid", "+IReadOnlyList<ValidationIssue> Issues", "+int ExitCode")),
        ),
        class_relations=(
            'AuthoringKitRelease "1" *-- "*" AgentInstruction : contains',
            'AuthoringKitRelease "1" *-- "*" SkillDefinition : contains',
            'GenerationRun --> SourceScope : obeys',
            'GenerationRun --> AuthoringKitRelease : uses',
            'GenerationRun *-- GenerationManifest : records',
            'GenerationRun ..> LocalValidationResult : produces',
        ),
        sequence_name="generate-and-validate-package",
        sequence_frontend=(p("participant", "agent", "Customer-selected agent"), p("participant", "cli", "RepoFluent.ContractCli")),
        sequence_api=(p("participant", "download", "AuthoringKitDownloadEndpoint"),),
        sequence_domain=(p("participant", "guidance", "Agent Guidance Bundle"), p("participant", "manifest", "GenerationManifestWriter"), p("participant", "validator", "CurriculumPackageValidator")),
        sequence_infrastructure=(p("database", "registry", "Authoring kit registry"), p("database", "source", "Approved source snapshot"), p("database", "workspace", "Authoring workspace")),
        sequence_steps=(
            "actor -> download : Request a compatible kit release",
            "download -> registry : Read immutable release",
            "registry --> download : Signed bundle and checksum",
            "download --> agent : Authoring kit release",
            "agent -> guidance : Load repository and kit instructions",
            "guidance --> agent : Scope, provenance, and safety constraints",
            "agent -> source : Read declared repositories and documents",
            "source --> agent : Approved source material",
            "agent -> workspace : Write candidate curriculum package",
            "agent -> manifest : Record source snapshot and tool metadata",
            "manifest -> workspace : Write manifest and package checksum",
            "agent -> cli : Validate candidate package locally",
            "cli -> validator : Apply pinned contract release",
            "validator -> workspace : Read candidate bytes",
            "workspace --> validator : Package and manifest",
            "validator --> cli : Stable issue set",
            "cli --> agent : Exit status and safe report",
        ),
    ),
    Subsystem(
        slug="04-curriculum-lifecycle",
        title="Curriculum Lifecycle",
        acronym="CLI",
        actor="Curriculum operator",
        actor_description="Uploads, reviews, approves, publishes, or retires curriculum within an assigned role",
        purpose="moves uploaded packages through controlled validation, draft, review, immutable publication, comparison, and retirement",
        boundary="The subsystem owns import receipts, processing state, validation orchestration, draft identity, review decisions, approval checksums, publication state, version comparison, and retirement. The Curriculum Input Contract defines package semantics, and Learning Experience renders published content.",
        definitions=(
            ("import receipt", "tenant-scoped acknowledgement that binds uploaded bytes, checksum, actor, and processing state"),
            ("curriculum draft", "mutable review workspace created atomically from a valid package"),
            ("curriculum version", "immutable published snapshot addressed independently from later drafts and releases"),
        ),
        frontend=(
            c("curriculum_ui", "Curriculum Workspace", "Angular 21", "Presents upload, validation, preview, review, publication, comparison, and retirement", "Foundation implemented"),
            c("preview_router", "Learner-equivalent Preview", "Angular 21", "Renders a draft through production lesson components and access policy", "Foundation implemented"),
        ),
        api=(
            c("lifecycle_endpoints", "CurriculumEndpoints", "ASP.NET Core", "Exposes role-gated lifecycle commands and status queries", "Foundation implemented"),
            c("workflow", "CurriculumWorkflow", ".NET application service", "Coordinates authorization, state transitions, persistence, and audit evidence", "Foundation implemented"),
            c("lifecycle_domain", "CurriculumLifecycle", ".NET domain model", "Enforces legal status transitions and immutable publication", "Foundation implemented"),
        ),
        worker=(
            c("validation_worker", "CurriculumValidationProcessor", ".NET worker", "Scans, validates, normalizes, and imports packages idempotently", "Hosted foundation implemented"),
            c("publication_projector", "PublicationProjector", ".NET worker", "Builds learner and search projections after publication", "Target platform"),
        ),
        tool=(),
        stores=(
            s("lifecycle_store", "Curriculum lifecycle schema", "Production relational database <TO SUPPLY>", "Stores receipts, drafts, decisions, versions, and state transitions", "Lifecycle state and immutable versions"),
            s("package_store", "Curriculum object store", "Encrypted object storage <TO SUPPLY>", "Stores quarantined uploads and approved immutable package bytes", "Package blobs"),
            s("work_queue", "Platform work queue", "Durable message broker <TO SUPPLY>", "Carries validation and projection jobs", "Asynchronous work"),
        ),
        externals=(
            x("scanner", "Content scanning service", "Evaluates uploaded packages using approved threat and secret policies"),
        ),
        relations=(
            ("actor", "curriculum_ui", "Operates curriculum using", "HTTPS"),
            ("curriculum_ui", "lifecycle_endpoints", "Calls", "JSON and multipart/HTTPS"),
            ("preview_router", "lifecycle_endpoints", "Reads authorized draft preview from", "JSON/HTTPS"),
            ("lifecycle_endpoints", "workflow", "Dispatches commands to", "in process"),
            ("workflow", "lifecycle_domain", "Applies transitions through", "in process"),
            ("workflow", "lifecycle_store", "Persists lifecycle state in", "SQL"),
            ("workflow", "package_store", "Writes uploaded bytes to", "object API"),
            ("workflow", "work_queue", "Enqueues validation through", "transactional outbox"),
            ("validation_worker", "work_queue", "Consumes validation jobs from", "broker protocol"),
            ("validation_worker", "scanner", "Scans package with", "provider API <TO SUPPLY>"),
            ("validation_worker", "package_store", "Reads inert bytes from", "object API"),
            ("validation_worker", "lifecycle_store", "Commits issues or draft atomically to", "SQL"),
            ("publication_projector", "lifecycle_store", "Reads publication events from", "outbox"),
        ),
        information_notes=(
            "The lifecycle schema is authoritative for status, review, approval, publication, and retirement.",
            "The object store retains uploaded and published bytes under classification and retention policy.",
            "Published versions remain immutable; a content change creates a new draft and version identity.",
        ),
        collaborations=(
            "Identity supplies actor and role context for each state transition.",
            "Curriculum Input Contract supplies deterministic validation semantics.",
            "Learning, Code Navigation, Assessment, and Analytics consume publication events and immutable version identifiers.",
            "Administration coordinates assignment after publication; Security governs scan, quarantine, and retention controls.",
        ),
        decisions=(
            "Production relational provider, object store, broker, and content scanner — `<TO SUPPLY>`.",
            "The current API-hosted validation loop moves to `RepoFluent.Worker` for production isolation and independent scaling.",
            "Semantic comparison and visual editing remain post-foundation capabilities within the same lifecycle boundary.",
        ),
        implementation_status="`CurriculumEndpoints`, `CurriculumWorkflow`, `CurriculumLifecycle`, `PackageValidator`, `CurriculumStore`, EF Core migrations, and `CurriculumValidationWorker` implement the golden-path foundation with SQLite. Production infrastructure and the separate worker executable remain target architecture.",
        classes=(
            ("ImportReceipt", ("+Guid Id", "+Guid TenantId", "+Checksum PackageChecksum", "+ProcessingStatus Status", "+BeginValidation(): void")),
            ("ValidationRun", ("+Guid Id", "+Guid ReceiptId", "+ValidatorVersion Version", "+IReadOnlyList<ValidationIssue> Issues", "+Complete(): void")),
            ("CurriculumDraft", ("+Guid Id", "+Guid TenantId", "+DraftStatus Status", "+Checksum Checksum", "+SubmitForReview(): void")),
            ("ReviewDecision", ("+Guid Id", "+Guid ReviewerId", "+Decision Outcome", "+Checksum ReviewedChecksum")),
            ("CurriculumVersion", ("+Guid Id", "+string StableCurriculumId", "+int Version", "+Checksum Checksum", "+Publish(): void")),
            ("LifecycleEvent", ("+Guid Id", "+Guid TenantId", "+string Type", "+DateTimeOffset OccurredAt")),
        ),
        class_relations=(
            'ImportReceipt "1" *-- "*" ValidationRun : records',
            'ImportReceipt "1" --> "0..1" CurriculumDraft : creates',
            'CurriculumDraft "1" *-- "*" ReviewDecision : receives',
            'CurriculumDraft "1" --> "0..1" CurriculumVersion : publishes as',
            'CurriculumDraft ..> LifecycleEvent : emits',
            'CurriculumVersion ..> LifecycleEvent : emits',
        ),
        sequence_name="validate-review-and-publish",
        sequence_frontend=(p("participant", "workspace", "Curriculum Workspace"), p("participant", "preview", "Learner-equivalent Preview")),
        sequence_api=(p("participant", "endpoints", "CurriculumEndpoints"),),
        sequence_domain=(p("participant", "workflow", "CurriculumWorkflow"), p("participant", "lifecycle", "CurriculumLifecycle"), p("participant", "validator", "CurriculumPackageValidator")),
        sequence_infrastructure=(p("database", "db", "Curriculum lifecycle schema"), p("database", "objects", "Curriculum object store"), p("queue", "queue", "Platform work queue"), p("participant", "worker", "CurriculumValidationProcessor")),
        sequence_steps=(
            "actor -> workspace : Upload curriculum package",
            "workspace -> endpoints : POST curriculum import",
            "endpoints -> workflow : Receive authorized package",
            "workflow -> objects : Store inert bytes and checksum",
            "objects --> workflow : Object reference",
            "workflow -> db : Commit receipt and outbox event",
            "db --> workflow : Receipt identifier",
            "workflow --> endpoints : Accepted receipt",
            "endpoints --> workspace : Processing status",
            "queue -> worker : Deliver validation job",
            "worker -> objects : Read quarantined package bytes",
            "objects --> worker : Package stream",
            "worker -> validator : Validate contract and semantic rules",
            "validator --> worker : Stable issue set",
            "worker -> db : Commit issues or draft atomically",
            "actor -> preview : Preview valid draft",
            "preview -> endpoints : GET authorized draft preview",
            "endpoints -> db : Read draft projection",
            "db --> endpoints : Learner-equivalent content",
            "endpoints --> preview : Draft preview",
            "actor -> workspace : Approve exact checksum and publish",
            "workspace -> endpoints : Review and publication commands",
            "endpoints -> workflow : Apply authorized transitions",
            "workflow -> lifecycle : Verify state and checksum",
            "lifecycle --> workflow : Immutable version result",
            "workflow -> db : Commit decision, version, and outbox",
            "db --> workflow : Published version identifier",
            "workflow --> workspace : Publication result",
        ),
    ),
    Subsystem(
        slug="05-learning-experience",
        title="Learning Experience",
        acronym="LEX",
        actor="Learner",
        actor_description="Studies assigned curriculum and records progress",
        purpose="delivers published curriculum as a coherent journey with durable progress, search, context, recommendations, and private learning artifacts",
        boundary="The subsystem owns learner home, course and lesson composition, progress semantics, resume behavior, learning search, glossary context, next-action selection, notes, bookmarks, and review recommendations. Code, assessments, source graphs, and analytics calculations remain in their owning subsystems.",
        definitions=(
            ("learning projection", "learner-safe read model built from an immutable curriculum version and current assignment state"),
            ("progress record", "monotonic durable state that identifies position, completion, version, and last accepted event"),
            ("next action", "explainable recommendation chosen from assigned, remediation, and review work"),
        ),
        frontend=(
            c("learning_home", "LearningHomePage", "Angular 21", "Presents assignments, status, due dates, activity, and next action", "Foundation implemented"),
            c("course_player", "Course and Lesson Player", "Angular 21", "Renders hierarchy, lesson blocks, glossary, progress, and context", "Foundation implemented"),
            c("lesson_renderer", "LessonRendererComponent", "Angular library", "Renders safe contract blocks through typed components", "Foundation implemented"),
        ),
        api=(
            c("learning_endpoints", "LearningEndpoints", "ASP.NET Core", "Returns learner-scoped assignments, courses, lessons, and progress commands", "Foundation implemented"),
            c("progress_coordinator", "ProgressCoordinator", ".NET application service", "Applies retry-safe monotonic progress semantics", "Target platform"),
            c("next_action", "NextActionSelector", ".NET domain service", "Explains the selected assignment, remediation, or review action", "Target platform"),
        ),
        worker=(
            c("learning_projector", "LearningProjectionBuilder", ".NET worker", "Builds learner-safe read models from publication and assignment events", "Target platform"),
            c("recommendation_worker", "ReviewRecommendationProcessor", ".NET worker", "Refreshes remediation and spaced-review candidates", "Target platform"),
        ),
        tool=(),
        stores=(
            s("learning_store", "Learning schema", "Production relational database <TO SUPPLY>", "Stores progress, notes, bookmarks, next actions, and projections", "Learner records"),
            s("search_index", "Learning search index", "Search service <TO SUPPLY>", "Indexes authorized published content and glossary terms", "Search projections"),
            s("learning_cache", "Learning cache", "Distributed cache <TO SUPPLY>", "Caches learner-safe published projections and navigation state", "Derived cache"),
        ),
        externals=(),
        relations=(
            ("actor", "learning_home", "Starts and resumes learning in", "HTTPS"),
            ("learning_home", "learning_endpoints", "Loads assignments from", "JSON/HTTPS"),
            ("course_player", "learning_endpoints", "Loads lessons and saves progress through", "JSON/HTTPS"),
            ("course_player", "lesson_renderer", "Renders typed blocks with", "Angular component API"),
            ("learning_endpoints", "progress_coordinator", "Dispatches progress to", "in process"),
            ("learning_endpoints", "next_action", "Requests recommendations from", "in process"),
            ("progress_coordinator", "learning_store", "Writes monotonic progress to", "SQL"),
            ("learning_endpoints", "search_index", "Searches authorized content in", "query API"),
            ("learning_endpoints", "learning_cache", "Reads cached projections from", "cache protocol"),
            ("learning_projector", "learning_store", "Builds versioned projections in", "SQL"),
            ("recommendation_worker", "learning_store", "Refreshes next actions in", "SQL"),
        ),
        information_notes=(
            "The learning schema is authoritative for accepted progress events, private artifacts, and derived next actions.",
            "Curriculum Lifecycle remains authoritative for published content and version status.",
            "Search and cache entries are disposable derived projections and preserve tenant, access, and version keys.",
        ),
        collaborations=(
            "Administration supplies assignments; Curriculum Lifecycle supplies immutable published versions.",
            "Code Navigation and Assessment render within the lesson context through typed frontend contracts.",
            "Assessment supplies remediation and mastery signals; Analytics consumes versioned progress events.",
            "Experience Platform supplies shell, accessibility, motion, and capability behavior.",
        ),
        decisions=(
            "Production search and cache providers — `<TO SUPPLY>`.",
            "Offline behavior, locale model, discussion policy, and spaced-review defaults — `<TO SUPPLY>`.",
            "Progress uses idempotency keys and server-side monotonic comparison; late older clients do not regress accepted state.",
        ),
        implementation_status="The Angular learning home, course page, lesson page, typed API library, lesson renderer, and API read paths implement the published-course foundation. Durable progress, search, private artifacts, and recommendations remain target components.",
        classes=(
            ("LearningAssignment", ("+Guid Id", "+Guid LearnerId", "+Guid CurriculumVersionId", "+AssignmentKind Kind", "+DateOnly? DueDate")),
            ("CourseProjection", ("+string CourseId", "+string Title", "+IReadOnlyList<LessonProjection> Lessons", "+Duration EstimatedDuration")),
            ("LessonProjection", ("+string LessonId", "+IReadOnlyList<ContentBlock> Blocks", "+IReadOnlyList<string> ObjectiveIds")),
            ("ProgressRecord", ("+Guid AssignmentId", "+string LessonId", "+ProgressState State", "+long Sequence", "+Apply(event): bool")),
            ("ProgressEvent", ("+Guid IdempotencyKey", "+long ClientSequence", "+ProgressState State", "+DateTimeOffset ObservedAt")),
            ("PrivateArtifact", ("+Guid Id", "+ArtifactKind Kind", "+string TargetId", "+string Content", "+Delete(): void")),
            ("NextAction", ("+ActionKind Kind", "+string TargetId", "+string Explanation", "+DateTimeOffset CalculatedAt")),
        ),
        class_relations=(
            'LearningAssignment "1" --> "1" CourseProjection : exposes',
            'CourseProjection "1" *-- "*" LessonProjection : contains',
            'LearningAssignment "1" *-- "*" ProgressRecord : tracks',
            'ProgressRecord "1" *-- "*" ProgressEvent : accepts',
            'LearningAssignment "1" o-- "*" PrivateArtifact : owns privately',
            'LearningAssignment "1" --> "0..1" NextAction : recommends',
        ),
        sequence_name="resume-and-complete-lesson",
        sequence_frontend=(p("participant", "home", "LearningHomePage"), p("participant", "player", "Course and Lesson Player"), p("participant", "client", "LearningApiClient")),
        sequence_api=(p("participant", "endpoints", "LearningEndpoints"),),
        sequence_domain=(p("participant", "progress", "ProgressCoordinator"), p("participant", "selector", "NextActionSelector")),
        sequence_infrastructure=(p("database", "db", "Learning schema"), p("database", "cache", "Learning cache"), p("database", "search", "Learning search index")),
        sequence_steps=(
            "actor -> home : Open learning home",
            "home -> client : Request assignments and next action",
            "client -> endpoints : GET learner assignments",
            "endpoints -> selector : Select explainable next action",
            "selector -> db : Read assignments, progress, and review candidates",
            "db --> selector : Learner-scoped state",
            "selector --> endpoints : Next action with explanation",
            "endpoints --> client : Home projection",
            "client --> home : Render assignments and next action",
            "actor -> player : Open assigned lesson",
            "player -> client : Request versioned lesson projection",
            "client -> endpoints : GET course and lesson",
            "endpoints -> cache : Read authorized published projection",
            "cache --> endpoints : Lesson and resume position",
            "endpoints --> player : Safe lesson blocks",
            "actor -> player : Advance and complete lesson",
            "player -> client : Save progress with idempotency key",
            "client -> endpoints : PUT progress event",
            "endpoints -> progress : Apply monotonic event",
            "progress -> db : Compare and commit accepted state",
            "db --> progress : Durable progress result",
            "progress --> endpoints : Accepted state",
            "endpoints --> player : Current progress",
            "player --> actor : Present completion and next action",
        ),
    ),
    Subsystem(
        slug="06-codebase-navigation",
        title="Codebase Navigation",
        acronym="CBN",
        actor="Learner",
        actor_description="Explores approved source context while retaining lesson position",
        purpose="connects learning content to authorized, revision-aware source excerpts, tours, symbols, and architecture relationships",
        boundary="The subsystem owns inert excerpt presentation, deep-link resolution, code-tour state, source-snapshot drift, file and symbol projections, and supplied architecture relationships. It does not edit source, execute package code, or perform unbounded static analysis.",
        definitions=(
            ("code reference", "repository-relative path with optional revision, symbol, and line anchors"),
            ("code tour", "ordered set of source references presented without discarding course and lesson context"),
            ("drift status", "comparison result between the curriculum source snapshot and an available current repository revision"),
        ),
        frontend=(
            c("code_view", "Code Navigator", "Angular 21", "Presents syntax-highlighted excerpts, file context, symbols, and safe external links", "Foundation implemented"),
            c("tour_controller", "CodeTourController", "Angular service", "Preserves lesson and tour position across source steps", "Target platform"),
            c("relationship_view", "Architecture Relationship View", "Angular and optional WebGPU", "Presents supplied relationships with a semantic fallback", "Target platform"),
        ),
        api=(
            c("code_endpoints", "CodeNavigationEndpoints", "ASP.NET Core", "Returns authorized references, excerpts, tours, trees, symbols, and drift", "Target platform"),
            c("reference_resolver", "CodeReferenceResolver", ".NET application service", "Resolves contract references against source snapshots and provider links", "Target platform"),
            c("code_policy", "CodeAccessPolicy", ".NET domain service", "Filters every source capability by tenant, content, and repository classification", "Target platform"),
        ),
        worker=(
            c("metadata_indexer", "CodeMetadataIndexer", ".NET worker", "Builds file, symbol, and relationship projections from imported metadata", "Target platform"),
            c("drift_checker", "SourceDriftChecker", ".NET worker", "Compares pinned snapshots with current authorized provider metadata", "Target platform"),
        ),
        tool=(),
        stores=(
            s("code_store", "Code metadata schema", "Production relational database <TO SUPPLY>", "Stores references, tours, snapshots, symbols, classifications, and drift", "Source metadata"),
            s("excerpt_store", "Approved excerpt store", "Encrypted object storage <TO SUPPLY>", "Stores minimized inert excerpts where policy permits", "Source excerpts"),
            s("code_search", "Code navigation index", "Search service <TO SUPPLY>", "Indexes permitted file, symbol, and relationship metadata", "Code projections"),
        ),
        externals=(
            x("repo_provider", "Repository provider", "Provides optional current read-only links and metadata under delegated authorization"),
        ),
        relations=(
            ("actor", "code_view", "Explores source through", "HTTPS"),
            ("code_view", "code_endpoints", "Requests authorized source context from", "JSON/HTTPS"),
            ("tour_controller", "code_endpoints", "Loads ordered tour steps from", "JSON/HTTPS"),
            ("relationship_view", "code_endpoints", "Loads supplied graph from", "JSON/HTTPS"),
            ("code_endpoints", "reference_resolver", "Resolves references through", "in process"),
            ("reference_resolver", "code_policy", "Checks every reference with", "in process"),
            ("reference_resolver", "code_store", "Reads snapshot and metadata from", "SQL"),
            ("reference_resolver", "excerpt_store", "Reads approved inert excerpt from", "object API"),
            ("reference_resolver", "repo_provider", "Builds authorized current link with", "provider API <TO SUPPLY>"),
            ("metadata_indexer", "code_store", "Writes imported projections to", "SQL"),
            ("metadata_indexer", "code_search", "Indexes permitted metadata in", "index API"),
            ("drift_checker", "repo_provider", "Reads current revision metadata from", "provider API <TO SUPPLY>"),
            ("drift_checker", "code_store", "Records drift state in", "SQL"),
        ),
        information_notes=(
            "Curriculum package source snapshots and references form the authoritative learning context.",
            "The code metadata schema stores platform identifiers separately from package identifiers and provider identifiers.",
            "Stored excerpts remain minimized, inert, classified, and optional; repository links remain subject to access checks at use time.",
        ),
        collaborations=(
            "Curriculum Input Contract defines reference and relationship shapes; Curriculum Lifecycle publishes them immutably.",
            "Learning Experience owns lesson context while Code Navigation owns source context and tour position.",
            "Identity and Security enforce repository classification; Experience Platform supplies progressive graph rendering.",
        ),
        decisions=(
            "Stored excerpt versus provider-link policy and first repository providers — `<TO SUPPLY>`.",
            "Syntax-highlighting engine, symbol metadata format, and material-drift threshold — `<TO SUPPLY>`.",
            "WebGPU relationship rendering remains optional and exposes the same information through semantic HTML.",
        ),
        implementation_status="The current contract and lesson renderer carry one repository-relative C# code reference. Full excerpt resolution, tours, symbols, drift checks, search, and provider integrations remain target architecture.",
        classes=(
            ("SourceSnapshot", ("+string RepositoryId", "+string Revision", "+DateTimeOffset CapturedAt", "+Compare(current): DriftStatus")),
            ("CodeReference", ("+string Id", "+string RelativePath", "+string? Symbol", "+LineRange? Lines", "+DataClassification Classification")),
            ("CodeExcerpt", ("+string ReferenceId", "+string Language", "+string InertText", "+Checksum Checksum")),
            ("CodeTour", ("+string Id", "+string LessonId", "+IReadOnlyList<CodeTourStep> Steps")),
            ("CodeTourStep", ("+int Order", "+string ReferenceId", "+string Explanation")),
            ("SymbolReference", ("+string SymbolId", "+SymbolKind Kind", "+string ReferenceId")),
            ("ArchitectureRelationship", ("+string FromId", "+string ToId", "+RelationshipKind Kind")),
        ),
        class_relations=(
            'SourceSnapshot "1" *-- "*" CodeReference : anchors',
            'CodeReference "1" --> "0..1" CodeExcerpt : resolves to',
            'CodeTour "1" *-- "*" CodeTourStep : orders',
            'CodeTourStep "*" --> "1" CodeReference : opens',
            'CodeReference "1" o-- "*" SymbolReference : identifies',
            'SymbolReference "1" o-- "*" ArchitectureRelationship : participates in',
        ),
        sequence_name="follow-code-tour",
        sequence_frontend=(p("participant", "lesson", "Course and Lesson Player"), p("participant", "tour", "CodeTourController"), p("participant", "view", "Code Navigator")),
        sequence_api=(p("participant", "endpoints", "CodeNavigationEndpoints"),),
        sequence_domain=(p("participant", "resolver", "CodeReferenceResolver"), p("participant", "policy", "CodeAccessPolicy")),
        sequence_infrastructure=(p("database", "metadata", "Code metadata schema"), p("database", "excerpts", "Approved excerpt store"), p("participant", "provider", "Repository provider")),
        sequence_steps=(
            "actor -> lesson : Open code tour from lesson",
            "lesson -> tour : Preserve lesson and tour context",
            "tour -> endpoints : Request authorized tour definition",
            "endpoints -> policy : Authorize tour and repository classification",
            "policy --> endpoints : Permit",
            "endpoints -> metadata : Read ordered references and source snapshot",
            "metadata --> endpoints : Tour projection",
            "endpoints --> tour : Versioned tour steps",
            "actor -> tour : Select current step",
            "tour -> endpoints : Resolve code reference",
            "endpoints -> resolver : Resolve against pinned source snapshot",
            "resolver -> policy : Recheck content and repository access",
            "policy --> resolver : Permit",
            "resolver -> metadata : Read anchors and drift status",
            "metadata --> resolver : Reference metadata",
            "alt approved excerpt is stored",
            "  resolver -> excerpts : Read inert minimized excerpt",
            "  excerpts --> resolver : Excerpt bytes",
            "else provider link is configured",
            "  resolver -> provider : Build current authorized read-only link",
            "  provider --> resolver : Link and current revision",
            "end",
            "resolver --> endpoints : Authorized reference projection",
            "endpoints --> view : Syntax, anchors, revision, and drift warning",
            "view --> actor : Present source without losing lesson context",
        ),
    ),
    Subsystem(
        slug="07-assessment-mastery",
        title="Assessment and Mastery",
        acronym="ASM",
        actor="Learner",
        actor_description="Completes formative quizzes and governed tests",
        purpose="runs assessments, protects answer material, preserves attempt evidence, and derives explainable objective-level mastery",
        boundary="The subsystem owns assessment delivery, question selection, attempt policy, response persistence, grading, feedback release, item invalidation, objective coverage, and mastery calculation. It does not own course navigation, manager reporting, or external certification.",
        definitions=(
            ("assessment attempt", "immutable version-bound record of governed timing, selected items, submitted responses, and grading outcome"),
            ("answer vault", "logically separated store that withholds protected answers and rationales until release policy permits access"),
            ("mastery record", "explainable objective-level result derived from documented evidence inputs and calculation version"),
        ),
        frontend=(
            c("assessment_runner", "Assessment Runner", "Angular 21", "Presents instructions, items, timing, save state, and submission", "Target platform"),
            c("result_view", "Assessment Result View", "Angular 21", "Presents permitted score, rationale, strengths, gaps, and remediation", "Target platform"),
        ),
        api=(
            c("assessment_endpoints", "AssessmentEndpoints", "ASP.NET Core", "Starts attempts, saves responses, submits, and returns authorized outcomes", "Target platform"),
            c("attempt_coordinator", "AttemptCoordinator", ".NET application service", "Enforces version, policy, time, attempt count, and idempotency", "Target platform"),
            c("grading_engine", "GradingEngine", ".NET domain service", "Grades supported deterministic question types against protected keys", "Target platform"),
            c("mastery_calculator", "MasteryCalculator", ".NET domain service", "Produces transparent objective-level mastery inputs and result", "Target platform"),
        ),
        worker=(
            c("mastery_projector", "MasteryProjector", ".NET worker", "Recalculates mastery after grading or approved item invalidation", "Target platform"),
            c("item_analyzer", "AssessmentQualityAnalyzer", ".NET worker", "Builds duplicate, leakage, coverage, and item-quality signals", "Target platform"),
        ),
        tool=(),
        stores=(
            s("assessment_store", "Assessment evidence schema", "Production relational database <TO SUPPLY>", "Stores definitions, policies, attempts, responses, grades, and mastery", "Assessment evidence"),
            s("answer_vault", "Protected answer vault", "Encrypted logically separated storage <TO SUPPLY>", "Stores answer keys and unreleased rationales", "Protected assessment material"),
            s("assessment_queue", "Platform work queue", "Durable message broker <TO SUPPLY>", "Carries grading, mastery, and item-analysis work", "Assessment work"),
        ),
        externals=(),
        relations=(
            ("actor", "assessment_runner", "Completes assessments in", "HTTPS"),
            ("assessment_runner", "assessment_endpoints", "Starts, saves, and submits through", "JSON/HTTPS"),
            ("result_view", "assessment_endpoints", "Reads released outcome from", "JSON/HTTPS"),
            ("assessment_endpoints", "attempt_coordinator", "Dispatches attempt commands to", "in process"),
            ("attempt_coordinator", "assessment_store", "Reads policy and writes attempt evidence in", "SQL"),
            ("attempt_coordinator", "grading_engine", "Requests deterministic grading from", "in process"),
            ("grading_engine", "answer_vault", "Reads protected keys from", "restricted data access"),
            ("grading_engine", "assessment_store", "Commits grade outcome to", "SQL"),
            ("grading_engine", "assessment_queue", "Emits mastery work through", "transactional outbox"),
            ("mastery_projector", "assessment_queue", "Consumes mastery work from", "broker protocol"),
            ("mastery_projector", "mastery_calculator", "Calculates objective state with", "in process"),
            ("mastery_projector", "assessment_store", "Writes versioned mastery to", "SQL"),
            ("item_analyzer", "assessment_store", "Reads de-identified item evidence from", "SQL"),
        ),
        information_notes=(
            "Assessment definitions remain bound to immutable curriculum and item versions.",
            "Attempt evidence is append-oriented; approved invalidation adds corrective evidence rather than rewriting history.",
            "Answer keys remain in a logically separated access path and never enter learner-visible projections before release.",
        ),
        collaborations=(
            "Curriculum Input Contract defines supported question and policy representations.",
            "Learning Experience hosts formative checks and consumes remediation links.",
            "Analytics consumes versioned outcomes and mastery inputs after privacy policy is applied.",
            "Security controls answer separation, key access, and protected telemetry.",
        ),
        decisions=(
            "Trusted timing mechanism, assessment autosave cadence, and test interruption policy — `<TO SUPPLY>`.",
            "Certification status and tenant-configurable mastery formula governance — `<TO SUPPLY>`.",
            "The launch engine grades only question types with deterministic grading semantics.",
        ),
        implementation_status="The curriculum contract foundation can carry a simple knowledge-check shape. Governed attempts, answer separation, grading, invalidation, objective coverage, and mastery are not present in the current executable slice.",
        classes=(
            ("AssessmentDefinition", ("+string Id", "+Guid CurriculumVersionId", "+AttemptPolicy Policy", "+IReadOnlyList<QuestionRef> Pool")),
            ("Question", ("+string Id", "+QuestionType Type", "+IReadOnlyList<string> ObjectiveIds", "+ItemVersion Version")),
            ("AnswerKey", ("+string QuestionId", "+ProtectedAnswer Answer", "+string Rationale", "+FeedbackReleasePolicy Release")),
            ("AssessmentAttempt", ("+Guid Id", "+Guid LearnerId", "+AttemptStatus Status", "+DateTimeOffset StartedAt", "+Submit(key): GradeRequest")),
            ("Response", ("+string QuestionId", "+ResponseValue Value", "+DateTimeOffset SavedAt")),
            ("GradeResult", ("+decimal Score", "+bool Passed", "+IReadOnlyList<ObjectiveResult> Objectives", "+GraderVersion Version")),
            ("MasteryRecord", ("+string ObjectiveId", "+MasteryState State", "+EvidenceSummary Evidence", "+CalculationVersion Version")),
        ),
        class_relations=(
            'AssessmentDefinition "1" o-- "*" Question : selects from',
            'Question "1" --> "1" AnswerKey : protected by',
            'AssessmentDefinition "1" --> "*" AssessmentAttempt : governs',
            'AssessmentAttempt "1" *-- "*" Response : records',
            'AssessmentAttempt "1" --> "0..1" GradeResult : produces',
            'GradeResult "*" --> "*" MasteryRecord : contributes to',
        ),
        sequence_name="submit-grade-and-update-mastery",
        sequence_frontend=(p("participant", "runner", "Assessment Runner"), p("participant", "results", "Assessment Result View")),
        sequence_api=(p("participant", "endpoints", "AssessmentEndpoints"),),
        sequence_domain=(p("participant", "attempts", "AttemptCoordinator"), p("participant", "grader", "GradingEngine"), p("participant", "mastery", "MasteryCalculator")),
        sequence_infrastructure=(p("database", "db", "Assessment evidence schema"), p("database", "vault", "Protected answer vault"), p("queue", "queue", "Platform work queue"), p("participant", "projector", "MasteryProjector")),
        sequence_steps=(
            "actor -> runner : Submit governed assessment attempt",
            "runner -> endpoints : POST submission with idempotency key",
            "endpoints -> attempts : Validate actor, version, timing, and policy",
            "attempts -> db : Load active attempt and saved responses",
            "db --> attempts : Version-bound attempt state",
            "attempts -> grader : Grade deterministic responses",
            "grader -> vault : Read protected answer keys",
            "vault --> grader : Authorized keys and release policy",
            "grader -> db : Commit submission and grade atomically",
            "db --> grader : Immutable grade result",
            "grader -> queue : Publish mastery recalculation event",
            "grader --> attempts : Grade and learner-visible release state",
            "attempts --> endpoints : Submission result",
            "endpoints --> runner : Score or held-result status",
            "queue -> projector : Deliver mastery event",
            "projector -> db : Read versioned objective evidence",
            "db --> projector : Grade and prior mastery inputs",
            "projector -> mastery : Calculate documented objective state",
            "mastery --> projector : Explainable mastery result",
            "projector -> db : Commit calculation version and inputs",
            "actor -> results : Open released result",
            "results -> endpoints : GET authorized outcome",
            "endpoints -> db : Read learner-visible result projection",
            "db --> endpoints : Score, gaps, and remediation",
            "endpoints --> results : Released outcome",
            "results --> actor : Present result and next learning action",
        ),
    ),
    Subsystem(
        slug="08-analytics-reporting",
        title="Analytics and Reporting",
        acronym="ANR",
        actor="Authorized analytics user",
        actor_description="Inspects personal or scoped population measures",
        purpose="turns versioned learning evidence into authorized, privacy-safe learner and manager measures, comparisons, and exports",
        boundary="The subsystem owns metric definitions, event-to-fact projection, learner analytics, manager aggregation, privacy-safe drill-down, gap identification, content-quality measures, cohort comparison, and report export. It does not own source learning evidence or employee performance decisions.",
        definitions=(
            ("metric definition", "versioned formula, source lineage, filters, freshness rule, and display semantics for one measure"),
            ("analytics projection", "derived query model built from tenant-scoped assignment, progress, assessment, mastery, and curriculum-version evidence"),
            ("minimum-group policy", "privacy rule that suppresses an aggregate or drill-down when the visible population is too small"),
        ),
        frontend=(
            c("learner_analytics", "Learner Analytics View", "Angular 21", "Presents personal completion, objective coverage, results, recency, and next actions", "Target platform"),
            c("manager_analytics", "Manager Analytics Workspace", "Angular 21", "Presents scoped cohorts, systems, gaps, distributions, and transparent high-performance indicators", "Target platform"),
            c("report_builder", "Report Export Builder", "Angular 21", "Previews authorized filters, columns, privacy effects, and export status", "Target platform"),
        ),
        api=(
            c("analytics_endpoints", "AnalyticsEndpoints", "ASP.NET Core", "Serves learner, manager, content, cohort, and export queries", "Target platform"),
            c("analytics_policy", "AnalyticsPolicyGate", ".NET application service", "Applies role, team, content, and minimum-group policy before result materialization", "Target platform"),
            c("metric_engine", "MetricQueryEngine", ".NET application service", "Evaluates approved versioned metric definitions against projections", "Target platform"),
        ),
        worker=(
            c("analytics_projector", "AnalyticsProjectionBuilder", ".NET worker", "Builds versioned facts and aggregate projections from domain events", "Target platform"),
            c("export_worker", "ReportExportProcessor", ".NET worker", "Produces encrypted expiring exports after policy re-evaluation", "Target platform"),
        ),
        tool=(),
        stores=(
            s("analytics_store", "Analytics projection store", "Analytical relational or column store <TO SUPPLY>", "Stores versioned facts, dimensions, aggregates, and metric metadata", "Derived analytics"),
            s("export_store", "Report export store", "Encrypted object storage <TO SUPPLY>", "Stores time-bounded authorized export artifacts", "Report exports"),
            s("analytics_queue", "Platform work queue", "Durable message broker <TO SUPPLY>", "Carries projection and export jobs", "Analytics work"),
        ),
        externals=(),
        relations=(
            ("actor", "manager_analytics", "Explores scoped analytics in", "HTTPS"),
            ("learner_analytics", "analytics_endpoints", "Requests personal measures from", "JSON/HTTPS"),
            ("manager_analytics", "analytics_endpoints", "Requests scoped aggregates from", "JSON/HTTPS"),
            ("report_builder", "analytics_endpoints", "Requests and polls exports through", "JSON/HTTPS"),
            ("analytics_endpoints", "analytics_policy", "Authorizes dimensions and population with", "in process"),
            ("analytics_policy", "metric_engine", "Passes permitted query to", "in process"),
            ("metric_engine", "analytics_store", "Reads versioned projections from", "query protocol"),
            ("analytics_projector", "analytics_queue", "Consumes domain evidence from", "broker protocol"),
            ("analytics_projector", "analytics_store", "Upserts idempotent facts and aggregates in", "data protocol"),
            ("export_worker", "analytics_queue", "Consumes approved export job from", "broker protocol"),
            ("export_worker", "analytics_policy", "Re-evaluates export policy with", "in process"),
            ("export_worker", "analytics_store", "Reads permitted rows from", "query protocol"),
            ("export_worker", "export_store", "Writes expiring artifact to", "object API"),
        ),
        information_notes=(
            "Domain stores remain authoritative for assignment, progress, attempt, mastery, and curriculum-version evidence.",
            "The analytics store contains disposable but reproducible projections keyed by tenant, source event, metric version, and curriculum version.",
            "Exports retain the applied filters, policy version, actor, creation time, expiry, and audit reference.",
        ),
        collaborations=(
            "Learning, Assessment, Administration, and Curriculum Lifecycle publish versioned evidence through the platform event stream.",
            "Identity supplies manager scope and group membership; Security supplies minimum-group and export policy.",
            "Administration exposes export status and acceptable-use controls without rewriting analytics data.",
        ),
        decisions=(
            "Production analytical store, privacy threshold defaults, and export expiry — `<TO SUPPLY>`.",
            "Tenant opt-in and evidence definition for high-performing learner indicators — `<TO SUPPLY>`.",
            "Metrics remain component measures; time-on-learning never substitutes for demonstrated understanding.",
        ),
        implementation_status="The current vertical slice records data needed for basic future projections but contains no analytics API, projection worker, manager dashboard, or export flow.",
        classes=(
            ("MetricDefinition", ("+string Id", "+SemVer Version", "+string Formula", "+IReadOnlyList<string> SourceFields", "+FreshnessPolicy Freshness")),
            ("AnalyticsEvent", ("+Guid EventId", "+Guid TenantId", "+string Type", "+Guid CurriculumVersionId", "+DateTimeOffset OccurredAt")),
            ("LearningFact", ("+Guid LearnerId", "+string ObjectiveId", "+FactState State", "+DateTimeOffset EffectiveAt")),
            ("CohortDefinition", ("+string Id", "+PopulationFilter Filter", "+PolicyScope Scope")),
            ("MetricResult", ("+string MetricId", "+SemVer DefinitionVersion", "+DimensionSet Dimensions", "+decimal Value", "+DateTimeOffset FreshAt")),
            ("PrivacyDecision", ("+bool Permitted", "+SuppressionReason? Reason", "+PolicyVersion Version")),
            ("ReportExport", ("+Guid Id", "+Guid ActorId", "+QueryDefinition Query", "+ExportStatus Status", "+DateTimeOffset ExpiresAt")),
        ),
        class_relations=(
            'AnalyticsEvent "*" --> "*" LearningFact : projects into',
            'MetricDefinition ..> LearningFact : reads',
            'CohortDefinition --> LearningFact : filters',
            'MetricDefinition --> MetricResult : calculates',
            'MetricResult --> PrivacyDecision : is governed by',
            'ReportExport --> CohortDefinition : scopes',
            'ReportExport --> MetricDefinition : selects',
        ),
        sequence_name="query-and-export-analytics",
        sequence_frontend=(p("participant", "dashboard", "Manager Analytics Workspace"), p("participant", "builder", "Report Export Builder")),
        sequence_api=(p("participant", "endpoints", "AnalyticsEndpoints"),),
        sequence_domain=(p("participant", "policy", "AnalyticsPolicyGate"), p("participant", "metrics", "MetricQueryEngine")),
        sequence_infrastructure=(p("database", "store", "Analytics projection store"), p("queue", "queue", "Platform work queue"), p("participant", "worker", "ReportExportProcessor"), p("database", "exports", "Report export store")),
        sequence_steps=(
            "actor -> dashboard : Select team, curriculum version, and measure",
            "dashboard -> endpoints : GET scoped analytics query",
            "endpoints -> policy : Evaluate actor, dimensions, and population",
            "policy -> store : Resolve authorized population and group size",
            "store --> policy : Population metadata",
            "policy --> endpoints : Permitted query or suppression decision",
            "endpoints -> metrics : Evaluate approved metric definition",
            "metrics -> store : Query versioned facts and aggregates",
            "store --> metrics : Metric inputs and freshness",
            "metrics --> endpoints : Transparent metric result",
            "endpoints --> dashboard : Measures, lineage, and suppression state",
            "dashboard --> actor : Present scoped analytics",
            "actor -> builder : Request machine-readable export",
            "builder -> endpoints : POST export query",
            "endpoints -> policy : Authorize requested fields and population",
            "policy --> endpoints : Approved export scope",
            "endpoints -> queue : Enqueue export with actor and policy version",
            "queue --> endpoints : Export identifier",
            "endpoints --> builder : Accepted export status",
            "queue -> worker : Deliver export job",
            "worker -> policy : Re-evaluate current export policy",
            "policy --> worker : Permitted scope",
            "worker -> store : Read authorized rows",
            "store --> worker : Versioned result set",
            "worker -> exports : Write encrypted expiring artifact",
            "exports --> worker : Artifact reference and expiry",
        ),
    ),
    Subsystem(
        slug="09-administration-operations",
        title="Administration and Tenant Operations",
        acronym="ATO",
        actor="Tenant administrator",
        actor_description="Operates authorized tenant configuration and workflows",
        purpose="provides one tenant-scoped control plane for users, curricula, assignments, settings, status, retention, branding, diagnostics, and notifications",
        boundary="The subsystem owns the administration workspace, assignment policy and provenance, tenant settings, branding, notification preferences, retention request orchestration, and cross-subsystem status composition. It coordinates owner modules through APIs and events rather than writing their stores directly.",
        definitions=(
            ("tenant control plane", "authorized administration interface that coordinates domain-owned operations for one tenant"),
            ("assignment", "version-bound allocation of required or optional curriculum to a user or group with provenance and optional due date"),
            ("retention request", "audited orchestration record that applies approved retention or deletion policy across primary and derived stores"),
        ),
        frontend=(
            c("admin_workspace", "Administration Workspace", "Angular 21", "Presents users, groups, roles, curricula, assignments, settings, status, branding, and diagnostics", "Foundation partial"),
            c("operation_status", "Operation Status Center", "Angular 21", "Presents per-item outcomes and safe correlation identifiers for long-running work", "Target platform"),
        ),
        api=(
            c("admin_endpoints", "AdministrationEndpoints", "ASP.NET Core", "Exposes tenant configuration and orchestration commands", "Target platform"),
            c("assignment_service", "AssignmentService", ".NET application service", "Creates version-bound user or group assignments idempotently", "Foundation partial"),
            c("retention_coordinator", "RetentionCoordinator", ".NET application service", "Plans policy-governed retention and deletion across owners", "Target platform"),
            c("status_composer", "TenantStatusComposer", ".NET application service", "Combines safe status from owner modules without exposing payloads", "Target platform"),
        ),
        worker=(
            c("deletion_orchestrator", "DeletionOrchestrator", ".NET worker", "Executes approved primary and derived deletion steps with evidence", "Target platform"),
            c("notification_dispatcher", "NotificationDispatcher", ".NET worker", "Delivers configured assignment, due-date, publication, and failure notifications", "Target platform"),
        ),
        tool=(),
        stores=(
            s("admin_store", "Tenant operations schema", "Production relational database <TO SUPPLY>", "Stores assignments, settings, branding, preferences, and orchestration state", "Tenant operations"),
            s("admin_queue", "Platform work queue", "Durable message broker <TO SUPPLY>", "Carries deletion, notification, and bulk-operation jobs", "Administrative work"),
        ),
        externals=(
            x("notification_provider", "Notification provider", "Delivers approved tenant notification channels"),
        ),
        relations=(
            ("actor", "admin_workspace", "Administers tenant in", "HTTPS"),
            ("admin_workspace", "admin_endpoints", "Calls", "JSON/HTTPS"),
            ("operation_status", "admin_endpoints", "Reads safe status from", "JSON/HTTPS"),
            ("admin_endpoints", "assignment_service", "Dispatches assignments to", "in process"),
            ("admin_endpoints", "retention_coordinator", "Dispatches retention requests to", "in process"),
            ("admin_endpoints", "status_composer", "Requests owner status from", "in process"),
            ("assignment_service", "admin_store", "Writes assignments and provenance to", "SQL"),
            ("retention_coordinator", "admin_store", "Commits plan and outbox to", "SQL"),
            ("retention_coordinator", "admin_queue", "Enqueues approved deletion work through", "transactional outbox"),
            ("deletion_orchestrator", "admin_queue", "Consumes deletion work from", "broker protocol"),
            ("notification_dispatcher", "admin_queue", "Consumes notification work from", "broker protocol"),
            ("notification_dispatcher", "notification_provider", "Delivers through", "provider API <TO SUPPLY>"),
        ),
        information_notes=(
            "The tenant operations schema is authoritative for assignments, tenant settings, branding, notification preferences, and orchestration status.",
            "Identity, Curriculum, Learning, Assessment, Analytics, Security, and Observability remain authoritative for their domain state.",
            "Bulk operations retain requested scope, per-item outcome, idempotency key, actor, and audit correlation.",
        ),
        collaborations=(
            "Identity owns users, groups, and role grants; Curriculum Lifecycle owns content status and versions.",
            "Learning consumes assignments; Security owns retention constraints and audit policy.",
            "Observability supplies safe tenant diagnostics; external providers deliver notifications.",
        ),
        decisions=(
            "Notification channels, provider, retry schedule, and expiry policy — `<TO SUPPLY>`.",
            "Retention defaults, legal-hold integration, and deletion approval roles — `<TO SUPPLY>`.",
            "Administrative bulk operations use preview, explicit confirmation, idempotency, and per-item results.",
        ),
        implementation_status="The current API implements direct learner assignment during publication, and the Angular shell exposes role-oriented curriculum controls. Full administration, group assignment, settings, retention, branding, diagnostics, and notifications remain target architecture.",
        classes=(
            ("TenantSettings", ("+Guid TenantId", "+long Version", "+Locale DefaultLocale", "+Update(command): void")),
            ("Assignment", ("+Guid Id", "+Guid CurriculumVersionId", "+AssignmentKind Kind", "+DateOnly? DueDate", "+AssignmentSource Source")),
            ("AssignmentTarget", ("+TargetKind Kind", "+Guid TargetId", "+ResolveMembers(): IReadOnlyList<Guid>")),
            ("RetentionRequest", ("+Guid Id", "+RetentionScope Scope", "+RequestStatus Status", "+PolicyVersion Policy", "+Approve(): void")),
            ("RetentionStep", ("+string Owner", "+DeletionTarget Target", "+StepStatus Status", "+EvidenceRef Evidence")),
            ("BrandingConfiguration", ("+string DisplayName", "+AssetRef? Logo", "+TokenOverrides Tokens", "+ValidateContrast(): Result")),
            ("NotificationPreference", ("+Guid UserId", "+NotificationKind Kind", "+Channel Channel", "+bool Enabled")),
        ),
        class_relations=(
            'TenantSettings "1" o-- "1" BrandingConfiguration : includes',
            'Assignment "1" *-- "1" AssignmentTarget : targets',
            'RetentionRequest "1" *-- "*" RetentionStep : orchestrates',
            'TenantSettings "1" o-- "*" NotificationPreference : governs defaults for',
            'Assignment ..> NotificationPreference : triggers according to',
        ),
        sequence_name="assign-curriculum-to-group",
        sequence_frontend=(p("participant", "workspace", "Administration Workspace"), p("participant", "status", "Operation Status Center")),
        sequence_api=(p("participant", "endpoints", "AdministrationEndpoints"),),
        sequence_domain=(p("participant", "assignments", "AssignmentService"), p("participant", "policy", "AuthorizationPolicyEvaluator")),
        sequence_infrastructure=(p("database", "identity", "Identity schema"), p("database", "curriculum", "Curriculum lifecycle schema"), p("database", "admin", "Tenant operations schema"), p("queue", "queue", "Platform work queue")),
        sequence_steps=(
            "actor -> workspace : Select published version, group, kind, and due date",
            "workspace -> endpoints : POST assignment with idempotency key",
            "endpoints -> policy : Authorize tenant, curriculum, and group scope",
            "policy --> endpoints : Permit",
            "endpoints -> assignments : Create version-bound group assignment",
            "assignments -> identity : Resolve active group and membership version",
            "identity --> assignments : Authorized target snapshot",
            "assignments -> curriculum : Verify published curriculum version",
            "curriculum --> assignments : Immutable version metadata",
            "assignments -> admin : Commit assignment, provenance, and outbox",
            "admin --> assignments : Assignment identifier and affected count",
            "assignments -> queue : Publish learner-projection and notification work",
            "assignments --> endpoints : Per-target assignment result",
            "endpoints --> workspace : Created operation status",
            "workspace -> status : Open operation result",
            "status -> endpoints : GET safe operation status",
            "endpoints -> admin : Read assignment outcome",
            "admin --> endpoints : Status and correlation identifier",
            "endpoints --> status : Safe per-item result",
            "status --> actor : Present assignment outcome",
        ),
    ),
    Subsystem(
        slug="10-experience-platform",
        title="Experience Platform",
        acronym="EXP",
        actor="RepoFluent user",
        actor_description="Operates RepoFluent through a supported browser and input method",
        purpose="supplies the shared shell, design system, accessibility behavior, responsive patterns, progressive rendering, and frontend performance controls",
        boundary="The subsystem owns design tokens, shared Angular components, navigation context, responsive shell behavior, browser capability detection, WebGPU strategy, accessible visualization alternatives, client performance budgets, and frontend telemetry contracts. Domain modules retain content semantics and authorization.",
        definitions=(
            ("capability profile", "runtime record of browser, input, motion, viewport, and optional GPU capabilities used to select an equivalent renderer"),
            ("progressive renderer", "presentation strategy that adds visual capability without removing semantic content or controls"),
            ("navigation context", "serializable location, selection, split-view, and return state preserved across related learning tasks"),
        ),
        frontend=(
            c("shell", "RepoFluent Application Shell", "Angular 21", "Hosts routing, workspaces, navigation context, session state, and responsive layout", "Foundation implemented"),
            c("design_system", "RepoFluent Design System", "Angular library and CSS tokens", "Supplies accessible components, typography, color, spacing, elevation, and motion", "Foundation partial"),
            c("capability_broker", "BrowserCapabilityBroker", "Angular service", "Selects semantic, Canvas, or WebGPU renderer from measured capabilities and preferences", "Target platform"),
            c("gpu_renderer", "WebGPU Visualization Adapter", "WebGPU", "Adds spatial system and relationship rendering when available", "Target platform"),
            c("accessible_fallback", "Semantic Visualization Adapter", "Angular and SVG/HTML", "Presents equivalent navigable relationships without GPU dependence", "Target platform"),
            c("client_telemetry", "ClientExperienceTelemetry", "OpenTelemetry web", "Measures navigation, errors, responsiveness, and performance budgets", "Target platform"),
        ),
        api=(
            c("experience_endpoint", "ExperienceConfigurationEndpoint", "ASP.NET Core", "Returns tenant-safe theme, feature, browser, and asset configuration", "Target platform"),
        ),
        worker=(),
        tool=(),
        stores=(
            s("static_assets", "Static web asset store", "Versioned object storage and CDN <TO SUPPLY>", "Publishes hashed Angular, design-system, font, and visualization assets", "Frontend releases"),
        ),
        externals=(
            x("browser", "Supported browser platform", "Provides semantic DOM, accessibility APIs, navigation, storage, rendering, and optional WebGPU"),
            x("rum", "Experience telemetry backend", "Receives redacted client metrics, errors, traces, and capability dimensions"),
        ),
        relations=(
            ("actor", "shell", "Uses", "browser input and HTTPS"),
            ("shell", "design_system", "Composes interface from", "Angular APIs"),
            ("shell", "capability_broker", "Requests renderer selection from", "in process"),
            ("capability_broker", "browser", "Detects supported capabilities from", "browser APIs"),
            ("capability_broker", "gpu_renderer", "Selects when supported", "adapter contract"),
            ("capability_broker", "accessible_fallback", "Selects as baseline or fallback", "adapter contract"),
            ("shell", "experience_endpoint", "Loads approved tenant configuration from", "JSON/HTTPS"),
            ("shell", "static_assets", "Loads hashed release assets from", "HTTPS/CDN"),
            ("client_telemetry", "rum", "Emits redacted experience telemetry to", "OpenTelemetry"),
        ),
        information_notes=(
            "The source-controlled token and component packages define the baseline design system.",
            "Tenant branding stores only validated token overrides and approved assets; it cannot replace semantics or focus behavior.",
            "Client telemetry contains capability, timing, route template, release, and result dimensions without curriculum payloads.",
        ),
        collaborations=(
            "Every frontend workspace consumes the shell, design system, navigation context, and telemetry contracts.",
            "Code Navigation and Analytics use the progressive visualization adapters.",
            "Security constrains active content and telemetry; Observability owns production measurement and alerting.",
        ),
        decisions=(
            "Production browser matrix, device profiles, CDN, font strategy, and WebGPU feature set — `<TO SUPPLY>`.",
            "The non-GPU semantic renderer forms the baseline; WebGPU initialization or runtime failure changes presentation only.",
            "The existing `desigh-system` path remains unchanged until a separate repository migration is approved.",
        ),
        implementation_status="Angular 21 provides `repofluent-app`, source-level `api` and `components` libraries, production bundle budgets, route workspaces, and the initial lesson renderer. The complete token library, capability broker, WebGPU adapter, semantic graph fallback, and real-user monitoring remain target components.",
        classes=(
            ("DesignToken", ("+string Name", "+TokenKind Kind", "+string Value", "+Validate(): Result")),
            ("Theme", ("+string Id", "+IReadOnlyMap<string, DesignToken> Tokens", "+ValidateAccessibility(): Result")),
            ("ComponentContract", ("+string Name", "+SemanticRole Role", "+KeyboardContract Keyboard", "+MotionContract Motion")),
            ("CapabilityProfile", ("+bool WebGpu", "+bool ReducedMotion", "+ViewportClass Viewport", "+InputModes Inputs")),
            ("RenderStrategy", ("+RendererKind Kind", "+Supports(profile): bool", "+Render(model): RenderResult")),
            ("NavigationContext", ("+RouteRef Route", "+SelectionRef Selection", "+PaneState Panes", "+Restore(): void")),
            ("PerformanceBudget", ("+string Metric", "+Percentile Percentile", "+Duration Threshold", "+Evaluate(sample): BudgetResult")),
        ),
        class_relations=(
            'Theme "1" *-- "*" DesignToken : overrides',
            'ComponentContract ..> Theme : consumes',
            'CapabilityProfile --> RenderStrategy : selects',
            'ComponentContract ..> NavigationContext : preserves',
            'RenderStrategy ..> PerformanceBudget : is measured against',
        ),
        sequence_name="select-progressive-renderer",
        sequence_frontend=(p("participant", "shell", "RepoFluent Application Shell"), p("participant", "broker", "BrowserCapabilityBroker"), p("participant", "gpu", "WebGPU Visualization Adapter"), p("participant", "fallback", "Semantic Visualization Adapter")),
        sequence_api=(p("participant", "config", "ExperienceConfigurationEndpoint"),),
        sequence_domain=(p("participant", "contract", "Visualization contract"), p("participant", "budget", "PerformanceBudgetEvaluator")),
        sequence_infrastructure=(p("database", "assets", "Static web asset store"), p("participant", "browser", "Supported browser platform"), p("participant", "rum", "Experience telemetry backend")),
        sequence_steps=(
            "actor -> shell : Open system relationship view",
            "shell -> config : Request tenant-safe experience configuration",
            "config --> shell : Theme, feature, and browser policy",
            "shell -> assets : Load hashed visualization assets",
            "assets --> shell : Versioned frontend bundle",
            "shell -> broker : Select renderer for visualization model",
            "broker -> browser : Read capability and reduced-motion profile",
            "browser --> broker : Runtime CapabilityProfile",
            "broker -> contract : Verify both adapters support semantic model",
            "contract --> broker : Equivalent renderer contract",
            "alt WebGPU is permitted and initializes",
            "  broker -> gpu : Render progressive relationship view",
            "  gpu -> browser : Initialize GPU resources",
            "  browser --> gpu : Ready",
            "  gpu --> shell : Interactive rendered result",
            "else WebGPU is unavailable, reduced, or fails",
            "  broker -> fallback : Render semantic HTML and SVG view",
            "  fallback --> shell : Accessible rendered result",
            "end",
            "shell -> budget : Record interaction and frame measurements",
            "budget -> rum : Emit redacted budget result",
            "shell --> actor : Present operable relationship view",
        ),
    ),
    Subsystem(
        slug="11-security-privacy-compliance",
        title="Security, Privacy, and Compliance",
        acronym="SPC",
        actor="Security administrator",
        actor_description="Reviews policy, evidence, exceptions, and production readiness",
        purpose="establishes cross-cutting controls that protect tenant content and learning evidence throughout intake, processing, delivery, retention, and deletion",
        boundary="The subsystem owns security and privacy policy, classification, content-safety gates, encryption expectations, key access patterns, model-data restrictions, audit integrity, retention control, exceptions, threat and privacy reviews, and release evidence. Domain modules implement controls at their own boundaries.",
        definitions=(
            ("data classification", "policy label that determines permitted storage, rendering, access, telemetry, retention, and export behavior"),
            ("security control", "testable preventive, detective, or corrective mechanism with an owner and evidence source"),
            ("security exception", "time-bounded approved departure with scope, risk, compensating control, owner, and expiry"),
        ),
        frontend=(
            c("security_workspace", "Security and Privacy Workspace", "Angular 21", "Presents control status, classifications, retention policy, evidence, and exceptions", "Target platform"),
        ),
        api=(
            c("security_middleware", "SecurityPolicyMiddleware", "ASP.NET Core", "Applies transport, headers, request limits, classification, and deny-by-default controls", "Target platform"),
            c("content_gate", "ContentSafetyGate", ".NET application service", "Coordinates type, schema, size, active-content, malware, and secret checks", "Foundation partial"),
            c("audit_writer", "AuditWriter", ".NET application service", "Appends attributable tamper-evident security and administrative evidence", "Target platform"),
            c("classification_service", "DataClassificationService", ".NET domain service", "Resolves handling policy for content, answers, activity, analytics, and exports", "Target platform"),
        ),
        worker=(
            c("security_scan", "SecurityScanProcessor", ".NET worker", "Runs approved scanning stages against quarantined content", "Target platform"),
            c("audit_sealer", "AuditIntegrityProcessor", ".NET worker", "Seals audit batches and verifies continuity", "Target platform"),
            c("deletion_worker", "SecurityDeletionCoordinator", ".NET worker", "Verifies classification, retention, and legal constraints around deletion", "Target platform"),
        ),
        tool=(),
        stores=(
            s("security_store", "Security policy schema", "Production relational database <TO SUPPLY>", "Stores classification, policy versions, controls, reviews, and exceptions", "Security governance"),
            s("audit_store", "Tamper-evident audit ledger", "Append-only storage <TO SUPPLY>", "Stores attributable sensitive and administrative events", "Audit evidence"),
            s("quarantine", "Quarantine object store", "Encrypted isolated object storage <TO SUPPLY>", "Holds untrusted uploads until release or disposal", "Untrusted content"),
        ),
        externals=(
            x("key_service", "Key and secret management service", "Protects keys, secrets, credentials, and approved cryptographic operations"),
            x("scanner", "Threat and secret scanning providers", "Classify untrusted content using approved policy and signatures"),
        ),
        relations=(
            ("actor", "security_workspace", "Reviews security posture in", "HTTPS"),
            ("security_workspace", "security_middleware", "Calls protected security APIs through", "JSON/HTTPS"),
            ("security_middleware", "classification_service", "Requests handling policy from", "in process"),
            ("classification_service", "security_store", "Reads versioned policy from", "SQL"),
            ("content_gate", "quarantine", "Places untrusted bytes in", "object API"),
            ("content_gate", "security_scan", "Schedules scan through", "durable work"),
            ("security_scan", "scanner", "Scans quarantined object with", "provider API <TO SUPPLY>"),
            ("security_scan", "quarantine", "Releases or disposes object in", "object API"),
            ("audit_writer", "audit_store", "Appends evidence to", "append protocol"),
            ("audit_sealer", "audit_store", "Verifies and seals batches in", "append protocol"),
            ("security_middleware", "key_service", "Uses protected cryptographic operations from", "managed identity <TO SUPPLY>"),
            ("deletion_worker", "security_store", "Checks retention and exception policy in", "SQL"),
        ),
        information_notes=(
            "Domain stores remain authoritative for customer content and learning evidence; this subsystem owns handling policy and control evidence.",
            "The audit ledger separates event metadata from sensitive payloads and uses platform-generated tenant and record identifiers.",
            "Key material remains in the selected key service and never enters application configuration or telemetry.",
        ),
        collaborations=(
            "Every subsystem applies identity, classification, minimization, encryption, audit, retention, and redaction controls at its boundary.",
            "Curriculum Lifecycle and Assessment use restricted paths for untrusted packages and answer material.",
            "Administration initiates retention workflows; Observability protects and monitors operational evidence.",
        ),
        decisions=(
            "Hosting model, jurisdictions, key provider, audit ledger, scanners, retention defaults, and certification targets — `<TO SUPPLY>`.",
            "Production launch depends on approved threat model, privacy review, vulnerability process, incident plan, and restore evidence.",
            "Unknown identity, classification, policy, or key state produces deny or safe inert behavior.",
        ),
        implementation_status="The current API enforces development actor roles, package size, safe path validation, non-production authentication boundaries, and correlation identifiers. Production identity, encryption, scanning, audit integrity, data classification, retention, and readiness controls remain target architecture.",
        classes=(
            ("DataClassification", ("+string Id", "+ClassificationLevel Level", "+HandlingPolicy Policy", "+Evaluate(context): Decision")),
            ("SecurityPolicy", ("+string Id", "+SemVer Version", "+DateTimeOffset EffectiveAt", "+IReadOnlyList<ControlRef> Controls")),
            ("SecurityControl", ("+string Id", "+ControlKind Kind", "+string Owner", "+EvidenceRequirement Evidence")),
            ("AuditEvent", ("+Guid Id", "+Guid TenantId", "+Guid ActorId", "+string Action", "+Checksum ChainHash")),
            ("EncryptionEnvelope", ("+string Algorithm", "+KeyReference Key", "+byte[] Ciphertext", "+Decrypt(context): byte[]")),
            ("RetentionPolicy", ("+string Id", "+SemVer Version", "+RetentionRule Rules", "+Evaluate(record): RetentionDecision")),
            ("SecurityException", ("+Guid Id", "+string Scope", "+RiskRating Risk", "+DateTimeOffset ExpiresAt", "+Approve(actor): void")),
        ),
        class_relations=(
            'SecurityPolicy "1" *-- "*" SecurityControl : defines',
            'DataClassification --> SecurityPolicy : selects handling from',
            'SecurityControl ..> AuditEvent : produces evidence as',
            'DataClassification ..> EncryptionEnvelope : governs',
            'RetentionPolicy --> DataClassification : varies by',
            'SecurityException --> SecurityControl : compensates for',
        ),
        sequence_name="scan-and-release-upload",
        sequence_frontend=(p("participant", "curriculum", "Curriculum Workspace"), p("participant", "security", "Security and Privacy Workspace")),
        sequence_api=(p("participant", "middleware", "SecurityPolicyMiddleware"), p("participant", "gate", "ContentSafetyGate")),
        sequence_domain=(p("participant", "classification", "DataClassificationService"), p("participant", "audit", "AuditWriter")),
        sequence_infrastructure=(p("database", "policy", "Security policy schema"), p("database", "quarantine", "Quarantine object store"), p("participant", "scanner", "Threat and secret scanning providers"), p("database", "ledger", "Tamper-evident audit ledger")),
        sequence_steps=(
            "actor -> curriculum : Upload curriculum package",
            "curriculum -> middleware : Send authenticated bounded request",
            "middleware -> classification : Resolve tenant and content handling policy",
            "classification -> policy : Read effective classification and control versions",
            "policy --> classification : Handling decision",
            "classification --> middleware : Permit bounded intake",
            "middleware -> gate : Pass inert stream and trusted context",
            "gate -> quarantine : Store encrypted untrusted bytes",
            "quarantine --> gate : Object reference and checksum",
            "gate -> scanner : Request malware, active-content, and secret scans",
            "scanner -> quarantine : Read isolated object",
            "quarantine --> scanner : Untrusted bytes",
            "scanner --> gate : Normalized scan decisions",
            "alt all required controls pass",
            "  gate -> audit : Record release decision and policy versions",
            "  audit -> ledger : Append chained event",
            "  ledger --> audit : Evidence reference",
            "  gate --> middleware : Released package reference",
            "else any blocking control fails or is unknown",
            "  gate -> audit : Record non-disclosing rejection evidence",
            "  audit -> ledger : Append chained event",
            "  gate --> middleware : Safe rejection code",
            "end",
            "middleware --> curriculum : Accepted receipt or safe problem",
        ),
    ),
    Subsystem(
        slug="12-observability-supportability",
        title="Observability and Supportability",
        acronym="OBS",
        actor="Platform operator",
        actor_description="Monitors, diagnoses, restores, and supports RepoFluent within approved access",
        purpose="provides correlated telemetry, monitoring, safe diagnostics, reliability controls, backup evidence, incident practice, and production release gates",
        boundary="The subsystem owns telemetry conventions, correlation, health, service indicators, alerts, support diagnostics, stale-job detection, idempotency infrastructure, backup and restore evidence, incident procedures, and operational release gates. Domain modules remain responsible for correct business events and safe failure behavior.",
        definitions=(
            ("correlation context", "safe trace, request, job, and operation identifiers propagated across browser, API, worker, audit, and support activity"),
            ("service indicator", "measured signal with a defined population, source, calculation, owner, and target"),
            ("support diagnostic", "tenant-safe status and correlation evidence that excludes curriculum, source, answer, token, and sensitive free-text payloads"),
        ),
        frontend=(
            c("client_telemetry", "Client Telemetry Adapter", "OpenTelemetry web", "Emits redacted navigation, rendering, error, and performance signals", "Target platform"),
            c("support_ui", "Tenant Support Diagnostics", "Angular 21", "Presents safe health, job status, and correlation identifiers to authorized administrators", "Target platform"),
        ),
        api=(
            c("correlation", "CorrelationMiddleware", "ASP.NET Core", "Accepts or creates safe correlation and propagates trace context", "Foundation partial"),
            c("health", "HealthEndpoints", "ASP.NET Core", "Exposes liveness, readiness, and dependency state by approved audience", "Foundation partial"),
            c("diagnostics", "SupportDiagnosticsService", ".NET application service", "Composes tenant-safe operation status and support references", "Target platform"),
            c("idempotency", "IdempotencyCoordinator", ".NET application service", "Deduplicates retried learning, assessment, and administrative writes", "Target platform"),
        ),
        worker=(
            c("stale_monitor", "StaleJobMonitor", ".NET worker", "Detects stalled imports, projections, exports, notifications, and deletions", "Target platform"),
            c("backup_verifier", "BackupRestoreVerifier", ".NET worker and runbook", "Records backup coverage and scheduled restore evidence", "Target platform"),
            c("release_gate", "OperationalReadinessGate", "Delivery pipeline tool", "Evaluates telemetry, security, migration, restore, and rollback evidence before release", "Target platform"),
        ),
        tool=(),
        stores=(
            s("telemetry", "Telemetry backend", "OpenTelemetry-compatible platform <TO SUPPLY>", "Stores bounded traces, metrics, logs, dashboards, and alerts", "Operational telemetry"),
            s("reliability_store", "Reliability schema", "Production relational database <TO SUPPLY>", "Stores idempotency keys, job leases, support references, and readiness evidence", "Reliability state"),
            s("backup_vault", "Backup vault", "Isolated encrypted backup storage <TO SUPPLY>", "Stores protected database and object recovery points", "Recovery data"),
        ),
        externals=(
            x("paging", "Incident and paging platform", "Routes actionable alerts to the owning on-call path"),
        ),
        relations=(
            ("actor", "support_ui", "Inspects approved diagnostics in", "HTTPS"),
            ("client_telemetry", "telemetry", "Emits redacted client signals to", "OpenTelemetry"),
            ("support_ui", "diagnostics", "Requests tenant-safe diagnostics from", "JSON/HTTPS"),
            ("correlation", "telemetry", "Emits correlated server traces to", "OpenTelemetry"),
            ("health", "telemetry", "Publishes health state to", "OpenTelemetry"),
            ("diagnostics", "reliability_store", "Reads operation and support references from", "SQL"),
            ("idempotency", "reliability_store", "Claims and completes retry keys in", "SQL"),
            ("stale_monitor", "reliability_store", "Reads job leases and records incidents in", "SQL"),
            ("stale_monitor", "telemetry", "Emits stale-job signals to", "OpenTelemetry"),
            ("telemetry", "paging", "Routes actionable alerts to", "provider integration <TO SUPPLY>"),
            ("backup_verifier", "backup_vault", "Verifies protected recovery points in", "backup protocol <TO SUPPLY>"),
            ("release_gate", "telemetry", "Reads release indicators and evidence from", "query API"),
        ),
        information_notes=(
            "Domain stores remain authoritative for business state; the reliability schema owns idempotency, lease, and operational-evidence records.",
            "Telemetry uses bounded-cardinality identifiers and excludes protected content by default.",
            "Backup copies retain source classification, encryption, retention, access control, and deletion behavior.",
        ),
        collaborations=(
            "Every executable emits the shared correlation and telemetry envelope.",
            "Security defines redaction, operational access, encryption, audit, and incident constraints.",
            "Administration exposes a tenant-safe subset of diagnostics; platform operators use the restricted operational backend.",
        ),
        decisions=(
            "Telemetry, alerting, paging, backup providers, SLOs, RPO, RTO, and deployment topology — `<TO SUPPLY>`.",
            "Production releases use explicit schema migration, health verification, rollback criteria, and restore evidence.",
            "Telemetry failure never weakens domain authorization, validation, grading, or data-protection decisions.",
        ),
        implementation_status="The API exposes a basic health endpoint and correlation response header. Integration and E2E tests provide retry and workflow evidence. Structured OpenTelemetry, idempotency records, stale-job monitoring, support diagnostics, backup verification, and operational release gates remain target architecture.",
        classes=(
            ("TelemetryEnvelope", ("+TraceId TraceId", "+CorrelationId CorrelationId", "+string SignalName", "+BoundedAttributes Attributes", "+ValidateRedaction(): Result")),
            ("ServiceIndicator", ("+string Id", "+string Population", "+string Formula", "+Duration Window", "+Evaluate(): IndicatorResult")),
            ("AlertRule", ("+string Id", "+string Owner", "+AlertCondition Condition", "+RunbookRef Runbook")),
            ("SupportReference", ("+Guid Id", "+Guid? TenantId", "+CorrelationId CorrelationId", "+SafeStatus Status")),
            ("IdempotencyRecord", ("+Guid TenantId", "+string Operation", "+string Key", "+OperationState State", "+Claim(): ClaimResult")),
            ("BackupRecord", ("+Guid Id", "+BackupScope Scope", "+DateTimeOffset CreatedAt", "+Checksum Checksum", "+RestoreEvidence? Verification")),
            ("ReleaseGateEvidence", ("+string ReleaseId", "+IReadOnlyList<GateResult> Results", "+GateDecision Decision")),
        ),
        class_relations=(
            'TelemetryEnvelope "*" --> "*" ServiceIndicator : contributes to',
            'ServiceIndicator "1" --> "*" AlertRule : drives',
            'TelemetryEnvelope --> SupportReference : correlates',
            'IdempotencyRecord ..> TelemetryEnvelope : emits state through',
            'BackupRecord --> ReleaseGateEvidence : supplies restore evidence to',
            'ServiceIndicator --> ReleaseGateEvidence : supplies health evidence to',
        ),
        sequence_name="trace-and-diagnose-operation",
        sequence_frontend=(p("participant", "shell", "RepoFluent application shell"), p("participant", "support", "Tenant Support Diagnostics")),
        sequence_api=(p("participant", "correlation", "CorrelationMiddleware"), p("participant", "endpoint", "Domain endpoint"), p("participant", "diagnostics", "SupportDiagnosticsService")),
        sequence_domain=(p("participant", "idempotency", "IdempotencyCoordinator"),),
        sequence_infrastructure=(p("database", "reliability", "Reliability schema"), p("participant", "otel", "OpenTelemetry collector"), p("database", "backend", "Telemetry backend"), p("participant", "paging", "Incident and paging platform")),
        sequence_steps=(
            "actor -> shell : Start a retry-safe operation",
            "shell -> correlation : Send request with client operation identifier",
            "correlation -> correlation : Validate or create safe correlation context",
            "correlation -> otel : Start redacted server span",
            "correlation -> endpoint : Continue request with trace context",
            "endpoint -> idempotency : Claim tenant, operation, and idempotency key",
            "idempotency -> reliability : Insert or read operation record",
            "reliability --> idempotency : New, in-progress, or completed state",
            "idempotency --> endpoint : Execute or replay prior result",
            "endpoint -> reliability : Complete operation and safe support reference",
            "reliability --> endpoint : Durable result",
            "endpoint -> otel : Emit bounded result attributes",
            "otel -> backend : Export traces, metrics, and logs",
            "backend -> backend : Evaluate service indicators and alerts",
            "opt actionable user impact crosses alert policy",
            "  backend -> paging : Route owner, runbook, and correlation context",
            "end",
            "endpoint --> shell : Result and safe correlation identifier",
            "actor -> support : Open tenant support status",
            "support -> diagnostics : Request authorized operation status",
            "diagnostics -> reliability : Read safe support reference",
            "reliability --> diagnostics : Status without protected payload",
            "diagnostics --> support : Safe status and correlation identifier",
            "support --> actor : Present support result",
        ),
    ),
)


def escape_puml(value: str) -> str:
    return value.replace('"', "'").replace("\n", " ")


def component_rows(subsystem: Subsystem) -> str:
    rows: list[str] = []
    groups = (
        ("`repofluent-app`", subsystem.frontend),
        ("`RepoFluent.Api`", subsystem.api),
        ("`RepoFluent.Worker`", subsystem.worker),
        ("Authoring or delivery tool", subsystem.tool),
    )
    for deployment, components in groups:
        for component in components:
            rows.append(
                f"| {deployment} | `{component.name}` | {component.responsibility} | {component.state} |"
            )
    return "\n".join(rows)


def store_rows(subsystem: Subsystem) -> str:
    return "\n".join(
        f"| {store.record_group} | `{store.name}` | {store.responsibility} |"
        for store in subsystem.stores
    )


def bullet_lines(values: tuple[str, ...]) -> str:
    return "\n".join(f"- {value}" for value in values)


def subsystem_readme(subsystem: Subsystem) -> str:
    definitions = "\n".join(f"- **{term}** — {definition}" for term, definition in subsystem.definitions)
    return f"""# {subsystem.title}

## Overview

The {subsystem.title} subsystem {subsystem.purpose}. It occupies the
`{subsystem.slug}` bounded context defined by the subsystem requirements.

{subsystem.boundary}

The subsystem uses these local terms:

{definitions}

## Description

### Architectural boundary

The subsystem is a logical module in the RepoFluent modular platform. Frontend
components live in the single `repofluent-app` Angular application. Synchronous
commands and queries enter through `RepoFluent.Api`. Long-running or retryable
work runs in `RepoFluent.Worker`. The platform [context, container, subsystem,
and deployment views](../) define the shared runtime around this module.

### Deployable mapping

| Deployment unit | Component | Responsibility | Delivery state |
| --- | --- | --- | --- |
{component_rows(subsystem)}

### Information ownership

| Record group | Authoritative or derived store | Purpose |
| --- | --- | --- |
{store_rows(subsystem)}

{bullet_lines(subsystem.information_notes)}

### Collaborations

{bullet_lines(subsystem.collaborations)}

### Decisions and delivery status

{bullet_lines(subsystem.decisions)}

{subsystem.implementation_status}

## Diagrams

### Component view

The platform context and container views apply to every subsystem and are not
repeated here. This component view shows the subsystem parts, their deployment
homes, owned stores, and external collaborators.

![C4 component view for {subsystem.title.lower()}](diagrams/c4-component.png)

### Information model

The information model names the durable records and value relationships owned or
consumed by the subsystem. Storage-provider details remain outside this logical
view.

![Logical class structure for {subsystem.title.lower()}](diagrams/class-structure.png)

### Primary behaviour — {subsystem.sequence_name.replace('-', ' ')}

The sequence shows the principal subsystem behaviour across the frontend,
API, application/domain, and infrastructure boundaries. Alternate paths appear
where they change security, persistence, or user-visible outcomes.

![Sequence for {subsystem.sequence_name.replace('-', ' ')}](diagrams/sequence-{subsystem.sequence_name}.png)
"""


def component_diagram(subsystem: Subsystem) -> str:
    lines = [
        "@startuml",
        "!include <C4/C4_Component>",
        "LAYOUT_WITH_LEGEND()",
        f"title Components — {subsystem.title}",
        "",
        f'Person(actor, "{escape_puml(subsystem.actor)}", "{escape_puml(subsystem.actor_description)}")',
    ]
    groups = (
        ("web", "repofluent-app", subsystem.frontend),
        ("api", "RepoFluent.Api", subsystem.api),
        ("worker", "RepoFluent.Worker", subsystem.worker),
        ("tool", "Authoring and delivery environment", subsystem.tool),
    )
    for alias, name, components in groups:
        if not components:
            continue
        lines.append(f'Container_Boundary({alias}, "{name}") {{')
        for component in components:
            lines.append(
                f'  Component({component.alias}, "{escape_puml(component.name)}", '
                f'"{escape_puml(component.technology)}", "{escape_puml(component.responsibility)}")'
            )
        lines.append("}")
    for store in subsystem.stores:
        macro = "ContainerQueue" if "queue" in store.name.lower() else "ContainerDb"
        lines.append(
            f'{macro}({store.alias}, "{escape_puml(store.name)}", '
            f'"{escape_puml(store.technology)}", "{escape_puml(store.responsibility)}")'
        )
    for external in subsystem.externals:
        lines.append(
            f'System_Ext({external.alias}, "{escape_puml(external.name)}", '
            f'"{escape_puml(external.responsibility)}")'
        )
    lines.append("")
    for source, target, label, technology in subsystem.relations:
        lines.append(
            f'Rel({source}, {target}, "{escape_puml(label)}", "{escape_puml(technology)}")'
        )
    lines.extend(("@enduml", ""))
    return "\n".join(lines)


CLASS_SKIN = """skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 8
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam class {
  BorderColor #344054
  FontColor #101828
  BackgroundColor #F9FAFB
}
"""


def class_diagram(subsystem: Subsystem) -> str:
    lines = ["@startuml", CLASS_SKIN.rstrip(), f"title Logical information model — {subsystem.title}", ""]
    for name, members in subsystem.classes:
        lines.append(f"class {name} {{")
        lines.extend(f"  {member}" for member in members)
        lines.append("}")
        lines.append("")
    lines.extend(subsystem.class_relations)
    lines.extend(("@enduml", ""))
    return "\n".join(lines)


SEQUENCE_SKIN = """skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 12
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam rectangle {
  BorderColor #344054
  FontColor #101828
}
skinparam package {
  BorderColor #667085
  FontColor #101828
  BackgroundColor #F9FAFB
}
"""


def participant_line(participant: SequenceParticipant) -> str:
    return f'{participant.kind} "{escape_puml(participant.label)}" as {participant.alias}'


def sequence_diagram(subsystem: Subsystem) -> str:
    lines = [
        "@startuml",
        f"title UML sequence behaviour — {subsystem.sequence_name.replace('-', ' ')}",
        SEQUENCE_SKIN.rstrip(),
        f'actor "{escape_puml(subsystem.actor)}" as actor',
        'box "Frontend — RepoFluent client application" #E0F2FE',
    ]
    lines.extend(f"  {participant_line(item)}" for item in subsystem.sequence_frontend)
    lines.append("end box")
    lines.append('box "Backend — RepoFluent API application" #D1FADF')
    lines.extend(f"  {participant_line(item)}" for item in subsystem.sequence_api)
    lines.append("end box")
    lines.append('box "Backend — RepoFluent Application and Domain" #ECFDF3')
    lines.extend(f"  {participant_line(item)}" for item in subsystem.sequence_domain)
    lines.append("end box")
    lines.append('box "Backend — RepoFluent Infrastructure" #FFF4E5')
    lines.extend(f"  {participant_line(item)}" for item in subsystem.sequence_infrastructure)
    lines.append("end box")
    lines.extend(subsystem.sequence_steps)
    lines.extend(("@enduml", ""))
    return "\n".join(lines)


PLATFORM_README = """# RepoFluent platform high-level design

## Overview

RepoFluent is an enterprise codebase learning platform. It accepts portable
curriculum packages prepared from approved code and documentation, governs their
publication, delivers source-linked learning, records demonstrated understanding,
and presents authorized measures to learners and managers.

The platform uses a modular architecture with five executable roles. One Angular
web application serves learner, author, reviewer, manager, administrator, and
security workspaces. One ASP.NET Core API exposes synchronous capabilities. One
.NET worker processes asynchronous jobs. One local .NET tool validates curriculum
inside the customer's approved environment. One migration job applies production
database changes before application rollout.

- **modular platform** — deployable set with bounded subsystem modules, explicit
data ownership, and in-process collaboration inside each executable

- **published version** — immutable curriculum snapshot that remains the reference
for assignments, progress, attempts, mastery, and analytics evidence

- **platform event** — versioned tenant-scoped fact written with domain state and
delivered asynchronously through an outbox and durable broker

The design describes the target production architecture and identifies the
foundation already present in the repository. Provider, hosting, scale, and
policy decisions that lack an approved source remain marked `<TO SUPPLY>`.

## Description

### Architecture form

RepoFluent starts as a modular monolith with an independently scalable worker.
The architecture keeps the twelve requirement subsystems as bounded modules in
the web, API, application, domain, infrastructure, and worker codebases. Modules
call public application contracts in process for synchronous work. Modules use
transactional outbox events for long-running work and cross-module projections.

This form keeps the first production system operable while preserving extraction
boundaries. A module may become a separate service only after measured scaling,
availability, security, ownership, or release constraints justify the additional
network and operational boundary.

The accepted [foundational architecture ADR](../adr/0001-foundational-application-architecture.md)
establishes the layered .NET and Angular foundation. The
[development authentication ADR](../adr/0002-development-persona-authentication.md)
limits persona authentication to non-production environments. A production
hosting, database, identity, messaging, and storage decision requires additional
ADRs before deployment.

### Runtime executables and web applications

| Deployment artifact | Type | Responsibility | Current delivery state |
| --- | --- | --- | --- |
| `repofluent-app` | Angular 21 single-page web application | Hosts learner, curriculum, code, assessment, analytics, administration, security, and support workspaces | Application shell and golden-path workspaces exist |
| `RepoFluent.Api` | ASP.NET Core web API | Terminates authenticated API requests and runs synchronous subsystem application logic | Golden-path API exists on .NET 10 |
| `RepoFluent.Worker` | .NET worker process | Consumes validation, projection, grading, export, notification, deletion, drift, and monitoring jobs | Target executable; validation currently runs as an API hosted service |
| `RepoFluent.ContractCli` | Local .NET tool | Validates packages against pinned contract releases without sending customer material to RepoFluent | Target executable |
| `RepoFluent.Migrator` | One-shot .NET deployment job | Applies approved schema migrations before compatible API and worker rollout | Target executable; Development and E2E currently migrate during API startup |

The Angular `api` and `components` projects are libraries consumed by
`repofluent-app`; they are not independent web applications. The agent guidance,
JSON Schema, ICD, fixtures, prompts, and skills are versioned artifacts rather
than hosted executables.

### Source and delivery structure

| Repository area | Architectural role |
| --- | --- |
| `frontend/projects/repofluent-app` | Web application and route-level subsystem workspaces |
| `frontend/projects/api` | Typed API clients, DTOs, authentication/session integration, and request correlation |
| `frontend/projects/components` | Shared semantic renderers and design-system components |
| `backend/src/RepoFluent.Api` | HTTP host, authentication, authorization, middleware, endpoints, and composition root |
| `backend/src/RepoFluent.Application` | Use cases, module contracts, actor context, commands, queries, and ports |
| `backend/src/RepoFluent.Domain` | State transitions, invariants, policies, and domain events |
| `backend/src/RepoFluent.Infrastructure` | Persistence, messaging, object storage, search, identity, scanning, and provider adapters |
| `backend/src/RepoFluent.Worker` | Target background host using the same application and infrastructure modules |
| `backend/src/RepoFluent.ContractCli` | Target offline contract-validation host |
| `backend/src/RepoFluent.Migrator` | Target production schema-migration host |
| `contracts/curriculum` | Versioned curriculum schema, ICD notes, fixtures, and release metadata |
| `docs/specs` | L1 and L2 product requirement baseline by subsystem |

### Production infrastructure inventory

| Infrastructure capability | Purpose | Production selection |
| --- | --- | --- |
| DNS, TLS, CDN, web application firewall, and rate controls | Protect and accelerate the public web and API entry point | `<TO SUPPLY>` |
| Static web asset origin | Store immutable hashed Angular releases and approved public assets | `<TO SUPPLY>` |
| Container registry and orchestrator | Run versioned API and worker images with health, rollout, and scaling policy | `<TO SUPPLY>` |
| Relational database | Hold tenant-scoped transactional state, outbox events, and logical subsystem schemas | `<TO SUPPLY>`; SQLite remains local/test only |
| Encrypted object storage | Hold quarantined packages, published assets, minimized excerpts, exports, and backups | `<TO SUPPLY>` |
| Durable message broker | Decouple committed domain work from worker processing | `<TO SUPPLY>` |
| Distributed cache | Hold disposable tenant/version-keyed read projections and rate state | `<TO SUPPLY>` |
| Search service | Index permitted published learning and code metadata | `<TO SUPPLY>` |
| Enterprise identity provider | Authenticate production users and optionally provision directory state | `<TO SUPPLY>` |
| Key and secret management | Protect service credentials, data keys, signing keys, and cryptographic operations | `<TO SUPPLY>` |
| Content and secret scanning | Classify inert uploads before draft import or rendering | `<TO SUPPLY>` |
| OpenTelemetry collector and operations backend | Collect redacted traces, metrics, logs, dashboards, alerts, and service indicators | `<TO SUPPLY>` |
| Notification provider | Deliver approved assignment, due-date, publication, and failure notifications | `<TO SUPPLY>` |
| Backup vault | Retain encrypted isolated recovery points and restore evidence | `<TO SUPPLY>` |
| CI/CD and policy gates | Build, test, scan, sign, migrate, deploy, verify, and roll back releases | `<TO SUPPLY>` |

### Subsystem map

| Subsystem | Platform responsibility | Primary runtime placement |
| --- | --- | --- |
| [Identity, Tenancy, and Access](01-identity-tenancy-access/) | Tenant identity, authentication, authorization, groups, sessions, and identity audit | Web, API, worker, relational store, identity provider |
| [Curriculum Input Contract](02-curriculum-input-contract/) | Schema, ICD, fixtures, validation vocabulary, compatibility, and contract registry | Contract CLI, shared library, API registry, artifact storage |
| [Agent Authoring Kit](03-agent-authoring-kit/) | Agent guidance, prompts, skills, ecosystem rules, local validation, and generation manifest | Customer authoring environment, Contract CLI, artifact storage |
| [Curriculum Lifecycle](04-curriculum-lifecycle/) | Upload, scan, validation, draft, preview, review, publication, versioning, and retirement | Web, API, worker, relational/object stores, broker |
| [Learning Experience](05-learning-experience/) | Learning home, course delivery, progress, search, glossary, recommendations, and private artifacts | Web, API, worker, relational/search/cache stores |
| [Codebase Navigation](06-codebase-navigation/) | Excerpts, references, tours, source drift, symbols, and architecture relationships | Web, API, worker, relational/object/search stores |
| [Assessment and Mastery](07-assessment-mastery/) | Governed attempts, responses, grading, answer protection, coverage, and mastery | Web, API, worker, relational/protected stores |
| [Analytics and Reporting](08-analytics-reporting/) | Versioned projections, privacy-safe measures, gaps, comparisons, and exports | Web, API, worker, analytical/object stores |
| [Administration and Tenant Operations](09-administration-operations/) | Tenant control plane, assignments, settings, status, retention, branding, and notifications | Web, API, worker, relational store, notification provider |
| [Experience Platform](10-experience-platform/) | Design system, shell, accessibility, responsive behavior, WebGPU fallback, and performance | Web, CDN, browser, API configuration |
| [Security, Privacy, and Compliance](11-security-privacy-compliance/) | Classification, safe intake, encryption, audit, retention policy, and readiness controls | Every executable, worker controls, key/scanning/audit infrastructure |
| [Observability and Supportability](12-observability-supportability/) | Correlation, telemetry, diagnostics, reliability, backup, incidents, and release gates | Every executable, worker monitors, telemetry and backup infrastructure |

### Data ownership and consistency

The production relational database may use one physical cluster, but each
subsystem owns a logical schema and migration boundary. One module does not write
another module's tables. Synchronous application contracts serve consistency
checks that fit one request. Versioned events and projections serve asynchronous
cross-module views.

State-changing operations commit domain state, audit intent, and outbox records
in one local transaction. `RepoFluent.Worker` publishes and consumes those events
with tenant, source record, event version, correlation, and idempotency keys.
Consumers tolerate duplicate and out-of-order delivery. Search, cache, and
analytics remain rebuildable from authoritative state and versioned evidence.

Published curriculum versions, submitted assessment attempts, grades, and audit
events are append-oriented evidence. Corrections add a new version, invalidation,
or compensating record instead of rewriting history.

### Trust boundaries and data flow

The browser, customer authoring environment, uploaded package, repository
provider, identity provider, and notification provider are separate trust
boundaries. The edge enforces transport and coarse request controls. The API
derives tenant and actor context on the server and applies resource policy before
reading protected state. Workers repeat authorization and classification checks
that remain relevant at execution time.

Uploaded content enters encrypted quarantine as inert bytes. Scan and contract
validation complete before draft import. Renderers accept typed safe content and
never execute package scripts, binaries, macros, or arbitrary active HTML.
Protected answers use a logically separated access path. Logs, traces, errors,
support views, and exports exclude protected payloads by default.

### Availability, scale, and release behavior

The web release uses immutable hashed assets. API replicas remain stateless apart
from external session and data services. Worker replicas scale by queue and job
class. Each job type uses explicit lease, idempotency, retry, poison-message, and
staleness policy. Provider-specific replica counts and scale limits remain
`<TO SUPPLY>`.

The production release order is compatible database expansion, application
deployment, health verification, traffic shift, and deferred contract cleanup.
`RepoFluent.Migrator` runs as an explicit gated job. The delivery pipeline records
test, accessibility, security, dependency, migration, rollback, backup, and
restore evidence before production promotion.

### Current foundation

The repository contains the Angular 21 application, .NET 10 layered backend,
SQLite migration, development persona authentication, asynchronous validation
hosted inside the API, curriculum contract `0.1.0`, and an acceptance-tested
curriculum-to-learning path. This foundation proves one workflow; it does not
constitute the production infrastructure shown in the deployment view.

## Diagrams

### System context

RepoFluent connects five human roles and a customer-controlled authoring agent to
enterprise identity, approved source, repository, notification, and operations
systems. Source analysis remains outside the hosted platform for the initial
architecture.

![C4 system context for RepoFluent](diagrams/c4-context.png)

### Runtime containers

The container view names every runtime executable and primary data service. The
single web application calls the API, while durable jobs move to the worker
through committed outbox records and the message broker.

![C4 container view for RepoFluent](diagrams/c4-container.png)

### Logical subsystems

The subsystem view maps all twelve bounded contexts into the web, API, worker,
and local authoring executables. Cross-cutting security and observability apply
to every boundary.

![C4 component view of RepoFluent subsystems](diagrams/c4-component.png)

### Production deployment

The deployment view separates the public edge, application runtime, data
services, management services, and external enterprise providers. Product and
cloud provider selections remain open where the diagram shows `<TO SUPPLY>`.

![Production deployment view for RepoFluent](diagrams/deployment.png)

### Behaviour — curriculum to publication

The content path begins with local agent generation and validation. Hosted intake
uses quarantine, asynchronous validation, human review, immutable publication,
and assignment before learner visibility.

![Sequence from curriculum generation to publication](diagrams/sequence-content-to-publication.png)

### Behaviour — learning to insight

The learning path reads an immutable version, records idempotent progress and
assessment evidence, projects analytics asynchronously, and applies manager scope
and privacy policy before presentation.

![Sequence from learning activity to authorized insight](diagrams/sequence-learning-to-insight.png)
"""


PLATFORM_DIAGRAMS = {
    "c4-context.puml": r'''@startuml
!include <C4/C4_Context>
LAYOUT_WITH_LEGEND()
title System Context — RepoFluent

Person(learner, "Learner", "Studies code-linked curriculum and demonstrates understanding")
Person(author, "Author and reviewer", "Uploads, reviews, approves, and publishes curriculum")
Person(manager, "Manager and tenant administrator", "Assigns learning and inspects authorized outcomes")
Person(operator, "Platform operator", "Operates and supports the hosted platform")
Person(agent, "Curriculum authoring agent", "Analyzes approved source in a customer-controlled environment")

System(repofluent, "RepoFluent", "Enterprise codebase learning platform")
System_Ext(idp, "Enterprise identity provider", "Authenticates users and optionally provisions directory state")
System_Ext(sources, "Approved source systems", "Repositories and documents used to prepare curriculum")
System_Ext(repo, "Repository provider", "Optional current read-only links and revision metadata")
System_Ext(notify, "Notification provider", "Delivers approved tenant notifications")
System_Ext(ops, "Operations platform", "Telemetry, alerting, incidents, and support evidence")

Rel(learner, repofluent, "Learns and completes assessments using", "HTTPS")
Rel(author, repofluent, "Governs curriculum using", "HTTPS")
Rel(manager, repofluent, "Administers and reports using", "HTTPS")
Rel(operator, repofluent, "Operates with", "restricted HTTPS")
Rel(agent, sources, "Reads declared snapshot from", "customer-controlled access")
Rel(agent, repofluent, "Supplies locally validated package to", "JSON upload/HTTPS")
Rel(repofluent, idp, "Authenticates and provisions through", "standard <TO SUPPLY>")
Rel(repofluent, repo, "Resolves optional read-only source context through", "provider API <TO SUPPLY>")
Rel(repofluent, notify, "Sends configured notifications through", "provider API <TO SUPPLY>")
Rel(repofluent, ops, "Emits redacted telemetry and receives operational signals from", "OpenTelemetry and provider APIs")
@enduml
''',
    "c4-container.puml": r'''@startuml
!include <C4/C4_Container>
LAYOUT_WITH_LEGEND()
title Runtime Containers — RepoFluent

Person(user, "RepoFluent user", "Learner, author, reviewer, manager, administrator, security reviewer, or operator")
Person(agent, "Curriculum authoring agent", "Builds curriculum inside an approved environment")
System_Ext(idp, "Enterprise identity provider", "Authenticates production identities")
System_Ext(repo, "Repository provider", "Provides optional current read-only source context")
System_Ext(notify, "Notification provider", "Delivers approved messages")
System_Ext(telemetry, "Operations platform", "Stores telemetry and routes alerts")

System_Boundary(repofluent, "RepoFluent") {
  Container(web, "repofluent-app", "Angular 21", "Single web application for all product workspaces")
  Container(api, "RepoFluent.Api", "ASP.NET Core / .NET 10", "Authenticated synchronous API and modular application host")
  Container(worker, "RepoFluent.Worker", ".NET worker", "Asynchronous validation, projection, grading, export, notification, deletion, and monitoring")
  Container(cli, "RepoFluent.ContractCli", ".NET tool", "Offline package validation in the customer-approved environment")
  Container(migrator, "RepoFluent.Migrator", ".NET deployment job", "Applies approved production schema migrations")
  ContainerDb(db, "RepoFluent relational database", "Provider <TO SUPPLY>", "Tenant-scoped subsystem schemas, evidence, and outbox")
  ContainerDb(objects, "Encrypted object storage", "Provider <TO SUPPLY>", "Packages, approved excerpts, exports, assets, and recovery objects")
  ContainerQueue(broker, "Platform message broker", "Provider <TO SUPPLY>", "Durable asynchronous work and domain-event delivery")
  ContainerDb(cache, "Distributed cache", "Provider <TO SUPPLY>", "Disposable tenant/version-keyed read data")
  ContainerDb(search, "Search service", "Provider <TO SUPPLY>", "Authorized learning and code projections")
  ContainerDb(artifacts, "Contract and kit registry", "Provider <TO SUPPLY>", "Immutable schema, ICD, fixture, CLI, and authoring-kit releases")
}

Rel(user, web, "Uses", "HTTPS")
Rel(web, api, "Calls", "JSON/HTTPS")
Rel(api, idp, "Authenticates with", "OIDC or SAML <TO SUPPLY>")
Rel(api, db, "Reads and writes owned schemas", "data protocol <TO SUPPLY>")
Rel(api, objects, "Writes and reads authorized objects", "object API")
Rel(api, broker, "Publishes committed work through outbox", "broker protocol")
Rel(api, cache, "Reads and invalidates derived cache", "cache protocol")
Rel(api, search, "Queries authorized indexes", "search API")
Rel(worker, broker, "Consumes and publishes idempotent work", "broker protocol")
Rel(worker, db, "Reads and writes owned schemas and outbox", "data protocol <TO SUPPLY>")
Rel(worker, objects, "Processes classified objects", "object API")
Rel(worker, cache, "Refreshes or invalidates derived cache", "cache protocol")
Rel(worker, search, "Builds authorized indexes", "index API")
Rel(worker, repo, "Reads optional revision metadata from", "provider API <TO SUPPLY>")
Rel(worker, notify, "Delivers configured notifications through", "provider API <TO SUPPLY>")
Rel(api, telemetry, "Emits redacted telemetry to", "OpenTelemetry")
Rel(worker, telemetry, "Emits redacted telemetry to", "OpenTelemetry")
Rel(web, telemetry, "Emits redacted experience telemetry to", "OpenTelemetry")
Rel(agent, cli, "Validates generated package with", "local process")
Rel(cli, artifacts, "Obtains pinned contract and kit artifacts from", "HTTPS or offline bundle")
Rel(migrator, db, "Applies compatible schema migrations to", "data protocol <TO SUPPLY>")
@enduml
''',
    "c4-component.puml": r'''@startuml
!include <C4/C4_Component>
LAYOUT_WITH_LEGEND()
title Logical Subsystems and Deployment Homes — RepoFluent

Person(user, "RepoFluent user", "Uses role-authorized product workspaces")
Person(agent, "Curriculum authoring agent", "Builds packages in a customer-controlled environment")

Container_Boundary(web, "repofluent-app") {
  Component(exp, "Experience Platform", "Angular shell and libraries", "Design system, accessibility, capability, navigation, and performance")
  Component(product_ui, "Domain Workspaces", "Angular routes", "Learning, curriculum, code, assessment, analytics, administration, and security interfaces")
}
Container_Boundary(api, "RepoFluent.Api") {
  Component(ita, "Identity, Tenancy, and Access", ".NET module", "Trusted actor and authorization context")
  Component(cic, "Curriculum Input Contract", ".NET shared module", "Contract compatibility and validation semantics")
  Component(cli, "Curriculum Lifecycle", ".NET module", "Intake, draft, review, publication, and retirement")
  Component(lex, "Learning Experience", ".NET module", "Published learning, progress, search, and recommendations")
  Component(cbn, "Codebase Navigation", ".NET module", "Authorized source references, tours, symbols, and drift")
  Component(asm, "Assessment and Mastery", ".NET module", "Attempts, grading, answer protection, and mastery")
  Component(anr, "Analytics and Reporting", ".NET module", "Metric policy, queries, privacy, and exports")
  Component(ato, "Administration and Tenant Operations", ".NET module", "Tenant control plane, assignments, settings, and orchestration")
  Component(spc, "Security, Privacy, and Compliance", ".NET cross-cutting module", "Classification, content safety, audit, retention, and controls")
  Component(obs, "Observability and Supportability", ".NET cross-cutting module", "Correlation, diagnostics, idempotency, and health")
}
Container_Boundary(worker, "RepoFluent.Worker") {
  Component(jobs, "Subsystem Job Processors", ".NET hosted processors", "Validation, projection, grading, export, notification, deletion, drift, and monitoring")
}
Container_Boundary(authoring, "Customer authoring environment") {
  Component(aak, "Agent Authoring Kit", "AGENTS.md, prompts, skills, and tools", "Guided generation under declared source scope")
  Component(contract_cli, "RepoFluent.ContractCli", ".NET tool", "Pinned local contract validation")
}
ContainerDb(data, "Owned Data and Projections", "Relational, object, cache, and search services <TO SUPPLY>", "Tenant-scoped authoritative and derived state")
ContainerQueue(events, "Platform Event Stream", "Durable broker <TO SUPPLY>", "Committed asynchronous work and versioned events")

Rel(user, exp, "Uses product through")
Rel(exp, product_ui, "Hosts and governs")
Rel(product_ui, ita, "Sends authenticated requests through", "HTTPS")
Rel(ita, ato, "Supplies actor and resource policy to")
Rel(ato, cli, "Coordinates curriculum operations through")
Rel(cli, cic, "Validates packages with")
Rel(cli, lex, "Publishes immutable versions to", "platform event")
Rel(lex, cbn, "Embeds authorized source context from")
Rel(lex, asm, "Hosts assessment interactions from")
Rel(lex, anr, "Publishes versioned learning evidence to", "platform event")
Rel(asm, anr, "Publishes attempt and mastery evidence to", "platform event")
Rel(ato, lex, "Publishes assignments to", "platform event")
Rel(spc, ita, "Constrains identity and access controls for")
Rel(spc, cli, "Constrains intake, rendering, audit, and retention for")
Rel(spc, asm, "Protects answers and evidence for")
Rel(obs, cli, "Correlates and monitors")
Rel(obs, lex, "Correlates and protects retry-safe writes for")
Rel(obs, asm, "Correlates and protects submissions for")
Rel(cic, data, "Reads contract releases from")
Rel(cli, data, "Owns lifecycle records in")
Rel(lex, data, "Owns learning records in")
Rel(cbn, data, "Owns source metadata in")
Rel(asm, data, "Owns assessment evidence in")
Rel(anr, data, "Owns analytical projections in")
Rel(ato, data, "Owns tenant operations in")
Rel(jobs, events, "Consumes and publishes")
Rel(jobs, data, "Reads and writes owned module state")
Rel(agent, aak, "Executes")
Rel(aak, contract_cli, "Validates generated package with")
Rel(contract_cli, cic, "Shares versioned validation semantics with", "artifact release")
@enduml
''',
    "deployment.puml": r'''@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 10
skinparam defaultFontName Arial
skinparam ArrowColor #344054
skinparam linetype ortho
skinparam node {
  BorderColor #344054
  BackgroundColor #F9FAFB
  FontColor #101828
}
skinparam database {
  BorderColor #344054
  BackgroundColor #ECFDF3
  FontColor #101828
}
skinparam cloud {
  BorderColor #344054
  BackgroundColor #E0F2FE
  FontColor #101828
}
title Production Deployment — RepoFluent

node "User and authoring devices" as devices {
  artifact "Supported browser\nrepofluent-app" as browser
  artifact "Customer authoring environment\nAgent kit + ContractCli" as authoring
}

cloud "Public edge <TO SUPPLY>" as edge {
  node "DNS + TLS + CDN + WAF\nrate and request controls" as gateway
  artifact "Hashed Angular assets" as webassets
}

node "Application runtime <TO SUPPLY>" as runtime {
  node "API deployment" as apideploy {
    artifact "RepoFluent.Api replica 1..N" as api
  }
  node "Worker deployment" as workerdeploy {
    artifact "RepoFluent.Worker replica 1..N" as worker
  }
  node "Gated deployment jobs" as jobs {
    artifact "RepoFluent.Migrator" as migrator
  }
}

node "Tenant data services <TO SUPPLY>" as data {
  database "Relational database\nlogical subsystem schemas + outbox" as db
  database "Encrypted object storage\nquarantine + packages + excerpts + exports" as objects
  queue "Durable message broker\nwork + versioned events" as broker
  database "Distributed cache\ndisposable projections" as cache
  database "Search service\nauthorized indexes" as search
  database "Contract and kit registry\nimmutable release artifacts" as artifacts
}

node "Security and operations services <TO SUPPLY>" as management {
  node "Key and secret management" as keys
  node "OpenTelemetry collector" as otel
  database "Telemetry + dashboards + alerts" as observability
  database "Isolated backup vault" as backup
  node "Container registry + CI/CD gates" as delivery
}

cloud "Enterprise and provider systems" as external {
  node "Enterprise identity provider" as idp
  node "Repository provider" as repo
  node "Content + secret scanners" as scanners
  node "Notification provider" as notify
  node "Incident + paging platform" as incidents
}

browser --> gateway : HTTPS
gateway --> webassets
gateway --> api : HTTPS
authoring --> artifacts
authoring --> gateway : HTTPS
api --> idp
api --> db
api --> objects
api --> broker
api --> cache
api --> search
worker --> broker
worker --> db
worker --> objects
worker --> cache
worker --> search
worker --> repo
worker --> scanners
worker --> notify
migrator --> db
api --> keys
worker --> keys
api --> otel
worker --> otel
browser --> otel
otel --> observability
observability --> incidents
db --> backup
objects --> backup
delivery --> apideploy
delivery --> workerdeploy
delivery --> jobs
@enduml
''',
    "sequence-content-to-publication.puml": r'''@startuml
title UML sequence behaviour — curriculum to publication
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 12
skinparam defaultFontName Arial
skinparam ArrowColor #344054
actor "Curriculum authoring agent" as agent
actor "Author / reviewer / administrator" as operator
box "Frontend — Customer authoring and RepoFluent web" #E0F2FE
  participant "Agent Authoring Kit" as kit
  participant "RepoFluent.ContractCli" as cli
  participant "Curriculum Workspace" as web
end box
box "Backend — RepoFluent API application" #D1FADF
  participant "CurriculumEndpoints" as api
end box
box "Backend — RepoFluent Application and Domain" #ECFDF3
  participant "CurriculumWorkflow" as workflow
  participant "CurriculumLifecycle" as lifecycle
end box
box "Backend — RepoFluent Infrastructure" #FFF4E5
  database "Quarantine / package object store" as objects
  database "Curriculum lifecycle schema + outbox" as db
  queue "Platform message broker" as broker
  participant "RepoFluent.Worker" as worker
  participant "Content scanner + contract validator" as validator
end box

agent -> kit : Analyze declared approved source snapshot
kit --> agent : Contract-shaped package and generation manifest
agent -> cli : Validate package against pinned release
cli --> agent : Deterministic local result
operator -> web : Upload locally valid package
web -> api : POST authorized curriculum import
api -> workflow : Receive bounded inert stream
workflow -> objects : Store encrypted quarantined bytes
objects --> workflow : Object reference and checksum
workflow -> db : Commit receipt, actor evidence, and outbox
db --> workflow : Receipt identifier
workflow --> api : Accepted processing status
api --> web : Receipt and safe correlation identifier
db -> broker : Publish committed validation work
broker -> worker : Deliver validation job
worker -> objects : Read quarantined bytes
objects --> worker : Package stream
worker -> validator : Scan and validate contract semantics
validator --> worker : Normalized issues and release decision
worker -> db : Commit issues or atomic draft
operator -> web : Preview and approve exact draft checksum
web -> api : Review decision and publication command
api -> workflow : Apply authorized commands
workflow -> lifecycle : Enforce state, role, checksum, and immutability
lifecycle --> workflow : Published version result
workflow -> db : Commit version, audit intent, and projection outbox
db --> workflow : Immutable version identifier
workflow --> api : Publication result
api --> web : Published status
operator -> web : Assign version to learner or group
web -> api : Assignment command
api -> db : Commit version-bound assignment and outbox
db --> api : Assignment result
api --> web : Per-target outcome
@enduml
''',
    "sequence-learning-to-insight.puml": r'''@startuml
title UML sequence behaviour — learning to authorized insight
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundcorner 12
skinparam defaultFontName Arial
skinparam ArrowColor #344054
actor "Learner" as learner
actor "Authorized manager" as manager
box "Frontend — repofluent-app" #E0F2FE
  participant "Course and Lesson Player" as player
  participant "Assessment Runner" as assessment
  participant "Manager Analytics Workspace" as analytics
end box
box "Backend — RepoFluent API application" #D1FADF
  participant "LearningEndpoints" as learningApi
  participant "AssessmentEndpoints" as assessmentApi
  participant "AnalyticsEndpoints" as analyticsApi
end box
box "Backend — RepoFluent Application and Domain" #ECFDF3
  participant "ProgressCoordinator" as progress
  participant "GradingEngine" as grading
  participant "AnalyticsPolicyGate" as policy
end box
box "Backend — RepoFluent Infrastructure" #FFF4E5
  database "Authoritative subsystem schemas + outbox" as db
  queue "Platform message broker" as broker
  participant "RepoFluent.Worker" as worker
  database "Analytics projection store" as projections
end box

learner -> player : Open assigned immutable curriculum version
player -> learningApi : GET learner-scoped course and resume state
learningApi -> db : Read assignment, version, lesson, and progress
db --> learningApi : Authorized learning projection
learningApi --> player : Safe lesson and source context
learner -> player : Complete lesson activity
player -> learningApi : PUT progress with idempotency key
learningApi -> progress : Apply monotonic version-bound event
progress -> db : Commit progress and outbox atomically
db --> progress : Accepted durable state
progress --> learningApi : Current progress
learningApi --> player : Completion result
learner -> assessment : Submit governed assessment
assessment -> assessmentApi : POST version-bound responses and idempotency key
assessmentApi -> grading : Enforce policy and grade with protected answers
grading -> db : Commit attempt, grade, mastery input, and outbox
db --> grading : Immutable outcome
grading --> assessmentApi : Learner-visible release state
assessmentApi --> assessment : Score, held result, or remediation
db -> broker : Publish committed learning and assessment evidence
broker -> worker : Deliver idempotent projection events
worker -> projections : Upsert versioned facts and aggregates
projections --> worker : Projection checkpoints
manager -> analytics : Select permitted team, version, and measure
analytics -> analyticsApi : GET scoped analytics query
analyticsApi -> policy : Evaluate role, population, dimensions, and minimum group
policy -> projections : Read authorized population and metric inputs
projections --> policy : Versioned measures and freshness
policy --> analyticsApi : Permitted result or suppression decision
analyticsApi --> analytics : Transparent measures and policy state
analytics --> manager : Present authorized insight
@enduml
''',
}


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8", newline="\n")


def main() -> int:
    write_text(DESIGNS_ROOT / "README.md", PLATFORM_README)
    for name, source in PLATFORM_DIAGRAMS.items():
        write_text(DESIGNS_ROOT / "diagrams" / name, source)

    for subsystem in SUBSYSTEMS:
        base = DESIGNS_ROOT / subsystem.slug
        write_text(base / "README.md", subsystem_readme(subsystem))
        write_text(base / "diagrams" / "c4-component.puml", component_diagram(subsystem))
        write_text(base / "diagrams" / "class-structure.puml", class_diagram(subsystem))
        write_text(
            base / "diagrams" / f"sequence-{subsystem.sequence_name}.puml",
            sequence_diagram(subsystem),
        )

    print(f"Generated platform HLD and {len(SUBSYSTEMS)} subsystem HLDs in {DESIGNS_ROOT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
