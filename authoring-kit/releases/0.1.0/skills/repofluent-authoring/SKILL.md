---
name: repofluent-authoring
description: Generate a source-grounded RepoFluent curriculum package from an approved repository and document scope.
---

# RepoFluent curriculum authoring

Use this skill only after the author supplies an approved source scope,
revision, exclusions, output location, and data-handling constraints.

1. Read the applicable `AGENTS.md` guidance and resolve its directory scope.
2. Require a scope declaration containing approved repositories, documents,
   revisions, inclusions, exclusions, output location, and data-handling rules.
3. Run `node scripts/preflight.mjs <scope.json>` and stop on any blocking
   finding.
4. Read `contracts/ICD.md` and `contracts/curriculum.schema.json`.
5. Read `guides/citations-and-uncertainty.md`.
6. Follow `prompts/generate-curriculum.md`.
7. Use `examples/valid/order-processing.json` as a shape example, not as source
   evidence.
8. Write a structured evidence report that binds each claim and objective to
   the approved snapshot and preserves material uncertainty in the package.
9. Run
   `node scripts/validate-evidence.mjs <evidence-report.json> <scope.json>`.
10. Read `guides/stable-generation.md` and run
    `node scripts/generate-identities.mjs <identities.json>`.
11. Write the generated package to the declared output location.
12. Run `node scripts/validate.mjs <package.json>`.
13. Run
    `node scripts/finalize-generation.mjs <completed-run.json> <package.json>`.
14. Return the package and safe generation manifest. Return validation issues
    with stable paths. Do not include source excerpts,
   answers, secrets, or personal data in issue messages.

Network access is unnecessary for schema resolution and validation. Optional
source-provider access remains disabled unless the approved scope explicitly
enables it.
