---
name: repofluent-authoring
description: Generate a source-grounded RepoFluent curriculum package from an approved repository and document scope.
---

# RepoFluent curriculum authoring

Use this skill only after the author supplies an approved source scope,
revision, exclusions, output location, and data-handling constraints.

1. Read the applicable `AGENTS.md` guidance and resolve its directory scope.
2. Read `contracts/ICD.md` and `contracts/curriculum.schema.json`.
3. Follow `prompts/generate-curriculum.md`.
4. Use `examples/valid/order-processing.json` as a shape example, not as source
   evidence.
5. Write the generated package to the declared output location.
6. Run `node scripts/validate.mjs <package.json>`.
7. Return validation issues with stable paths. Do not include source excerpts,
   answers, secrets, or personal data in issue messages.

Network access is unnecessary for schema resolution and validation. Optional
source-provider access remains disabled unless the approved scope explicitly
enables it.
