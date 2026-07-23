# RepoFluent detailed designs

The detailed-design tree refines the L2 requirements in `docs/specs/` into
vertical feature slices. Each feature page contains an overview, concrete
building blocks, exact L2-to-L1 traceability, and rendered C4 and UML
diagrams with their PlantUML sources.

Unresolved technology, provider, scale, and deployment decisions remain
marked `<TO SUPPLY>` until the corresponding product or architecture decision
is approved.

## Subsystems

### Identity, Tenancy, and Access

- [Enforce tenant boundaries](01-identity-tenancy-access/enforce-tenant-boundaries/)
- [Onboard and authenticate users](01-identity-tenancy-access/onboard-and-authenticate-users/)
- [Authorize roles and scopes](01-identity-tenancy-access/authorize-roles-and-scopes/)
- [Manage groups and provisioning](01-identity-tenancy-access/manage-groups-and-provisioning/)
- [Govern sessions and access reviews](01-identity-tenancy-access/govern-sessions-and-access-reviews/)
- [Record identity audit evidence](01-identity-tenancy-access/record-identity-audit-evidence/)

### Curriculum Input Contract

- [Publish a versioned contract](02-curriculum-input-contract/publish-versioned-contract/)
- [Model a curriculum package](02-curriculum-input-contract/model-curriculum-package/)
- [Define safe content and code](02-curriculum-input-contract/define-safe-content-and-code/)
- [Record provenance and identities](02-curriculum-input-contract/record-provenance-and-identities/)
- [Validate packages and limits](02-curriculum-input-contract/validate-packages-and-limits/)
- [Support contract extensions](02-curriculum-input-contract/support-contract-extensions/)

### Agent Authoring Kit

- [Publish the authoring kit](03-agent-authoring-kit/publish-authoring-kit/)
- [Constrain agent scope](03-agent-authoring-kit/constrain-agent-scope/)
- [Cite sources and uncertainty](03-agent-authoring-kit/cite-sources-and-uncertainty/)
- [Generate stable curriculum](03-agent-authoring-kit/generate-stable-curriculum/)
- [Validate packages locally](03-agent-authoring-kit/validate-packages-locally/)
- [Analyze .NET and Angular](03-agent-authoring-kit/analyze-dotnet-and-angular/)

### Curriculum Lifecycle

- [Receive and validate a package](04-curriculum-lifecycle/receive-and-validate-package/)
- [Import a draft idempotently](04-curriculum-lifecycle/import-draft-idempotently/)
- [Preview and review a draft](04-curriculum-lifecycle/preview-and-review-draft/)
- [Publish an immutable version](04-curriculum-lifecycle/publish-immutable-version/)
- [Compare and retire versions](04-curriculum-lifecycle/compare-and-retire-versions/)
- [Operate and audit the lifecycle](04-curriculum-lifecycle/operate-and-audit-lifecycle/)
- [Edit contract-compatible content](04-curriculum-lifecycle/edit-contract-content/)

### Learning Experience

- [Present the learning home](05-learning-experience/present-learning-home/)
- [Render course lessons](05-learning-experience/render-course-lessons/)
- [Track and resume progress](05-learning-experience/track-and-resume-progress/)
- [Search and navigate learning](05-learning-experience/search-and-navigate-learning/)
- [Recommend remediation and review](05-learning-experience/recommend-remediation-and-review/)
- [Manage private learning artifacts](05-learning-experience/manage-private-learning-artifacts/)
- [Moderate learning discussion](05-learning-experience/moderate-learning-discussion/)

### Codebase Navigation

- [Render and resolve code](06-codebase-navigation/render-and-resolve-code/)
- [Open external code links](06-codebase-navigation/open-external-code-links/)
- [Follow code tours](06-codebase-navigation/follow-code-tours/)
- [Show source snapshot drift](06-codebase-navigation/show-source-snapshot-drift/)
- [Browse files and symbols](06-codebase-navigation/browse-files-and-symbols/)
- [Explore architecture relationships](06-codebase-navigation/explore-architecture-relationships/)

### Assessment and Mastery

- [Render assessment items](07-assessment-mastery/render-assessment-items/)
- [Start governed attempts](07-assessment-mastery/start-governed-attempts/)
- [Save and submit responses](07-assessment-mastery/save-and-submit-responses/)
- [Grade assessment outcomes](07-assessment-mastery/grade-assessment-outcomes/)
- [Manage objective coverage](07-assessment-mastery/manage-objective-coverage/)
- [Invalidate defective items](07-assessment-mastery/invalidate-defective-items/)
- [Calculate explainable mastery](07-assessment-mastery/calculate-explainable-mastery/)

### Analytics and Reporting

- [Govern metric definitions](08-analytics-reporting/govern-metric-definitions/)
- [Show learner analytics](08-analytics-reporting/show-learner-analytics/)
- [Explore manager analytics](08-analytics-reporting/explore-manager-analytics/)
- [Identify gaps and performance](08-analytics-reporting/identify-gaps-and-performance/)
- [Export reports](08-analytics-reporting/export-reports/)
- [Analyze content and cohorts](08-analytics-reporting/analyze-content-and-cohorts/)
- [Preserve versioned analytics](08-analytics-reporting/preserve-versioned-analytics/)

### Administration and Tenant Operations

- [Navigate tenant administration](09-administration-operations/navigate-tenant-administration/)
- [Manage users, groups, and roles](09-administration-operations/manage-users-groups-and-roles/)
- [Administer curricula and status](09-administration-operations/administer-curricula-and-status/)
- [Manage assignments](09-administration-operations/manage-assignments/)
- [Govern retention and deletion](09-administration-operations/govern-retention-and-deletion/)
- [Access support diagnostics](09-administration-operations/access-support-diagnostics/)
- [Configure tenant branding](09-administration-operations/configure-tenant-branding/)
- [Deliver tenant notifications](09-administration-operations/deliver-tenant-notifications/)

### Experience Platform

- [Govern the design system](10-experience-platform/govern-design-system/)
- [Provide progressive visualizations](10-experience-platform/provide-progressive-visualizations/)
- [Preserve responsive navigation](10-experience-platform/preserve-responsive-navigation/)
- [Enforce accessible interaction](10-experience-platform/enforce-accessible-interaction/)
- [Meet performance budgets](10-experience-platform/meet-performance-budgets/)
- [Govern browser capabilities](10-experience-platform/govern-browser-capabilities/)

### Security, Privacy, and Compliance

- [Isolate tenants and identifiers](11-security-privacy-compliance/isolate-tenants-and-identifiers/)
- [Control privileged access](11-security-privacy-compliance/control-privileged-access/)
- [Encrypt data and manage keys](11-security-privacy-compliance/encrypt-data-and-manage-keys/)
- [Restrict model data use](11-security-privacy-compliance/restrict-model-data-use/)
- [Secure content intake and rendering](11-security-privacy-compliance/secure-content-intake-and-rendering/)
- [Protect answers and source](11-security-privacy-compliance/protect-answers-and-source/)
- [Retain, delete, and audit data](11-security-privacy-compliance/retain-delete-and-audit-data/)
- [Redact operational data](11-security-privacy-compliance/redact-operational-data/)
- [Govern security readiness](11-security-privacy-compliance/govern-security-readiness/)

### Observability and Supportability

- [Standardize telemetry and correlation](12-observability-supportability/standardize-telemetry-and-correlation/)
- [Monitor import and learning](12-observability-supportability/monitor-import-and-learning/)
- [Guarantee idempotent learning writes](12-observability-supportability/guarantee-idempotent-learning-writes/)
- [Protect logs and errors](12-observability-supportability/protect-logs-and-errors/)
- [Provide tenant diagnostics](12-observability-supportability/provide-tenant-diagnostics/)
- [Govern service reliability](12-observability-supportability/govern-service-reliability/)
- [Back up and restore state](12-observability-supportability/back-up-and-restore-state/)
- [Respond to incidents](12-observability-supportability/respond-to-incidents/)
- [Gate production releases](12-observability-supportability/gate-production-releases/)
