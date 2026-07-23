import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const kitRoot = path.join(repositoryRoot, "authoring-kit", "releases");
const requiredArtifacts = new Set([
  "README.md",
  "AGENTS.md",
  "prompts/generate-curriculum.md",
  "skills/repofluent-authoring/SKILL.md",
  "guides/citations-and-uncertainty.md",
  "guides/stable-generation.md",
  "guides/local-validation.md",
  "contracts/curriculum.schema.json",
  "contracts/ICD.md",
  "examples/valid/order-processing.json",
  "examples/invalid/missing-title.json",
  "examples/warnings/unsupported-extension.json",
  "examples/scope/approved-scope.json",
  "examples/scope/secret-exposure-scope.json",
  "examples/evidence/valid-evidence-report.json",
  "examples/evidence/invalid-unrepresented-conflict.json",
  "examples/identities/regeneration-a.json",
  "examples/identities/regeneration-b.json",
  "examples/identities/collision.json",
  "examples/generation/completed-run.json",
  "examples/fixtures/repositories/order-platform/AGENTS.md",
  "examples/fixtures/repositories/order-platform/docs/architecture.md",
  "examples/fixtures/repositories/order-platform/docs/operations.md",
  "examples/fixtures/repositories/order-platform/src/app.ts",
  "examples/fixtures/repositories/order-platform/src/payments/AGENTS.md",
  "examples/fixtures/repositories/order-platform/src/payments/handler.ts",
  "examples/fixtures/repositories/order-platform/src/payments/private/ledger.txt",
  "examples/fixtures/repositories/secret-exposure/AGENTS.md",
  "examples/fixtures/repositories/secret-exposure/docs/architecture.md",
  "examples/fixtures/repositories/secret-exposure/src/config/application.env",
  "scripts/preflight.mjs",
  "scripts/validate-evidence.mjs",
  "scripts/generate-identities.mjs",
  "scripts/finalize-generation.mjs",
  "scripts/validate.mjs",
  "scripts/curriculum.validator.mjs",
  "scripts/verify-release.mjs",
  "release-notes.md",
  "checksums.sha256",
]);
const errors = [];
const releaseDirectories = (await readdir(kitRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const version of releaseDirectories) {
  await verifyRelease(version);
}

if (errors.length > 0) {
  console.error(`Authoring-kit verification errors: ${errors.length}`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`Authoring-kit releases verified: ${releaseDirectories.length}`);

async function verifyRelease(version) {
  const releaseRoot = path.join(kitRoot, version);
  const manifest = JSON.parse(
    await readFile(path.join(releaseRoot, "manifest.json"), "utf8"),
  );
  if (
    manifest.kitVersion !== version ||
    manifest.contractVersion !== "0.1.0" ||
    manifest.validatorVersion !== "0.1.0"
  ) {
    errors.push(`${version}: manifest versions are inconsistent`);
  }
  if (
    manifest.offline?.supported !== true ||
    manifest.offline?.validationRequiresNetwork !== false ||
    manifest.offline?.optionalNetworkFeaturesEnabledByDefault !== false
  ) {
    errors.push(`${version}: offline policy is not safe by default`);
  }

  const artifacts = manifest.artifacts ?? [];
  const paths = new Set(artifacts.map((artifact) => artifact.path));
  for (const requiredPath of requiredArtifacts) {
    if (!paths.has(requiredPath))
      errors.push(`${version}: missing ${requiredPath}`);
  }

  const pairs = [];
  for (const artifact of artifacts) {
    const bytes = await readFile(path.join(releaseRoot, artifact.path));
    const checksum = createHash("sha256").update(bytes).digest("hex");
    if (checksum !== artifact.sha256) {
      errors.push(`${version}: checksum mismatch for ${artifact.path}`);
    }
    pairs.push([artifact.path, checksum]);
  }
  const checksumInput = pairs
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([artifactPath, checksum]) => `${artifactPath}:${checksum}\n`)
    .join("");
  const releaseChecksum = createHash("sha256")
    .update(checksumInput)
    .digest("hex");
  if (manifest.releaseChecksum !== `sha256:${releaseChecksum}`) {
    errors.push(`${version}: release checksum mismatch`);
  }

  await compareFiles(
    version,
    path.join(releaseRoot, "contracts", "curriculum.schema.json"),
    path.join(
      repositoryRoot,
      "contracts",
      "curriculum",
      "0.1.0",
      "curriculum.schema.json",
    ),
  );
  await compareFiles(
    version,
    path.join(releaseRoot, "contracts", "ICD.md"),
    path.join(repositoryRoot, "contracts", "curriculum", "0.1.0", "ICD.md"),
  );

  const runtimeSource = await Promise.all(
    [
      "scripts/preflight.mjs",
      "scripts/validate-evidence.mjs",
      "scripts/generate-identities.mjs",
      "scripts/finalize-generation.mjs",
      "scripts/validate.mjs",
      "scripts/curriculum.validator.mjs",
    ].map((relativePath) =>
      readFile(path.join(releaseRoot, relativePath), "utf8"),
    ),
  );
  if (
    runtimeSource.some((source) =>
      /node:https?|fetch\s*\(|XMLHttpRequest/.test(source),
    )
  ) {
    errors.push(`${version}: validation runtime contains a network dependency`);
  }

  const verifier = spawnSync(
    process.execPath,
    [path.join(releaseRoot, "scripts", "verify-release.mjs")],
    { cwd: releaseRoot, encoding: "utf8" },
  );
  if (verifier.status !== 0)
    errors.push(`${version}: local checksum verification failed`);

  const valid = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate.mjs"),
      path.join(releaseRoot, "examples", "valid", "order-processing.json"),
      "--contract",
      "auto",
      "--format",
      "json",
      "--threshold",
      "warning",
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
  if (
    valid.status !== 0 ||
    JSON.parse(valid.stdout).valid !== true ||
    JSON.parse(valid.stdout).outcome !== "success"
  ) {
    errors.push(`${version}: representative package did not validate offline`);
  }

  const warning = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate.mjs"),
      path.join(
        releaseRoot,
        "examples",
        "warnings",
        "unsupported-extension.json",
      ),
      "--contract",
      "auto",
      "--format",
      "json",
      "--threshold",
      "warning",
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
  const warningReport = parseReport(
    version,
    "warnings-only package",
    warning.stdout,
  );
  if (
    warning.status !== 3 ||
    warningReport?.valid !== true ||
    warningReport?.outcome !== "warnings-only" ||
    !warningReport?.issues?.some(
      (issue) =>
        issue.code === "CIC_EXTENSION_IGNORED" &&
        issue.path === "/extensions/0/namespace" &&
        issue.isBlocking === false,
    )
  ) {
    errors.push(`${version}: warnings-only package did not return status 3`);
  }

  const invalid = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate.mjs"),
      path.join(releaseRoot, "examples", "invalid", "missing-title.json"),
      "--contract",
      "auto",
      "--format",
      "json",
      "--threshold",
      "warning",
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
  if (
    invalid.status !== 1 ||
    !JSON.parse(invalid.stdout).issues?.some((issue) => issue.path === "/title")
  ) {
    errors.push(`${version}: invalid package did not fail at /title`);
  }

  const invocation = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate.mjs"),
      path.join(releaseRoot, "examples", "valid", "order-processing.json"),
      "--contract",
      "9.0.0",
    ],
    { cwd: releaseRoot, encoding: "utf8" },
  );
  if (
    invocation.status !== 2 ||
    !JSON.parse(invocation.stdout).issues?.some(
      (issue) =>
        issue.code === "AAK_VALIDATOR_INVOCATION" &&
        issue.path === "/contract",
    )
  ) {
    errors.push(`${version}: invalid invocation did not return status 2`);
  }

  const approvedPreflight = runPreflight(
    releaseRoot,
    path.join(releaseRoot, "examples", "scope", "approved-scope.json"),
  );
  const approvedReport = parseReport(
    version,
    "approved scope preflight",
    approvedPreflight.stdout,
  );
  if (
    approvedPreflight.status !== 0 ||
    approvedReport?.valid !== true ||
    !approvedReport.repositories?.[0]?.exclusions?.some(
      (exclusion) =>
        exclusion.path === "src/payments/private/ledger.txt" &&
        exclusion.guidance === "src/payments/AGENTS.md",
    )
  ) {
    errors.push(
      `${version}: approved scope did not preserve directory exclusions`,
    );
  }

  const secretPreflight = runPreflight(
    releaseRoot,
    path.join(releaseRoot, "examples", "scope", "secret-exposure-scope.json"),
  );
  const secretReport = parseReport(
    version,
    "secret-exposure preflight",
    secretPreflight.stdout,
  );
  const rawSecret = "AKIAREPOFLUENTDEMO12";
  if (
    secretPreflight.status !== 1 ||
    secretPreflight.stdout.includes(rawSecret) ||
    !secretReport?.findings?.some(
      (finding) =>
        finding.code === "AAK_SECRET_SUSPECTED" &&
        finding.path === "src/config/application.env" &&
        finding.isBlocking === true,
    )
  ) {
    errors.push(
      `${version}: suspected secret did not stop with a redacted report`,
    );
  }

  const validEvidence = runEvidenceValidation(
    releaseRoot,
    path.join(
      releaseRoot,
      "examples",
      "evidence",
      "valid-evidence-report.json",
    ),
  );
  const validEvidenceReport = parseReport(
    version,
    "valid evidence report",
    validEvidence.stdout,
  );
  if (
    validEvidence.status !== 0 ||
    validEvidenceReport?.valid !== true ||
    validEvidenceReport?.claims?.directEvidence !== 2 ||
    validEvidenceReport?.claims?.synthesis !== 1 ||
    validEvidenceReport?.uncertainty?.conflicts !== 1 ||
    validEvidenceReport?.uncertainty?.materialRepresentations !== 1
  ) {
    errors.push(
      `${version}: valid evidence report did not preserve source and uncertainty`,
    );
  }

  const invalidEvidence = runEvidenceValidation(
    releaseRoot,
    path.join(
      releaseRoot,
      "examples",
      "evidence",
      "invalid-unrepresented-conflict.json",
    ),
  );
  const invalidEvidenceReport = parseReport(
    version,
    "invalid evidence report",
    invalidEvidence.stdout,
  );
  if (
    invalidEvidence.status !== 1 ||
    !invalidEvidenceReport?.findings?.some(
      (finding) =>
        finding.code === "AAK_UNCERTAINTY_UNREPRESENTED" &&
        finding.path === "/uncertainty/conflicts/0/packageRepresentations" &&
        finding.isBlocking === true,
    )
  ) {
    errors.push(`${version}: unrepresented material conflict did not block`);
  }

  const firstIdentities = runIdentityGeneration(
    releaseRoot,
    "regeneration-a.json",
  );
  const secondIdentities = runIdentityGeneration(
    releaseRoot,
    "regeneration-b.json",
  );
  const firstIdentityReport = parseReport(
    version,
    "first identity run",
    firstIdentities.stdout,
  );
  const secondIdentityReport = parseReport(
    version,
    "reworded identity run",
    secondIdentities.stdout,
  );
  if (
    firstIdentities.status !== 0 ||
    secondIdentities.status !== 0 ||
    firstIdentityReport?.entities?.length !== 7 ||
    JSON.stringify(firstIdentityReport?.entities) !==
      JSON.stringify(secondIdentityReport?.entities)
  ) {
    errors.push(
      `${version}: prose-only changes did not preserve stable identities`,
    );
  }

  const collision = runIdentityGeneration(releaseRoot, "collision.json");
  const collisionReport = parseReport(
    version,
    "identity collision",
    collision.stdout,
  );
  if (
    collision.status !== 1 ||
    !collisionReport?.findings?.some(
      (finding) =>
        finding.code === "AAK_IDENTITY_COLLISION" &&
        finding.path === "/entities/1/semanticKey",
    )
  ) {
    errors.push(`${version}: semantic identity collision did not block`);
  }

  const finalized = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "finalize-generation.mjs"),
      path.join(releaseRoot, "examples", "generation", "completed-run.json"),
      path.join(releaseRoot, "examples", "valid", "order-processing.json"),
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
  const generationManifest = parseReport(
    version,
    "generation manifest",
    finalized.stdout,
  );
  if (
    finalized.status !== 0 ||
    generationManifest?.kitVersion !== version ||
    generationManifest?.validation?.valid !== true ||
    !/^sha256:[a-f0-9]{64}$/.test(generationManifest?.package?.sha256 ?? "") ||
    /chain.?of.?thought|credential|full.?prompt/i.test(finalized.stdout)
  ) {
    errors.push(`${version}: safe generation manifest did not finalize`);
  }
}

function runPreflight(releaseRoot, scopePath) {
  return spawnSync(
    process.execPath,
    [path.join(releaseRoot, "scripts", "preflight.mjs"), scopePath],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
}

function runEvidenceValidation(releaseRoot, reportPath) {
  return spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate-evidence.mjs"),
      reportPath,
      path.join(releaseRoot, "examples", "scope", "approved-scope.json"),
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
}

function runIdentityGeneration(releaseRoot, fixtureName) {
  return spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "generate-identities.mjs"),
      path.join(releaseRoot, "examples", "identities", fixtureName),
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
}

function parseReport(version, label, stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    errors.push(`${version}: ${label} did not emit JSON`);
    return null;
  }
}

async function compareFiles(version, bundledPath, sourcePath) {
  const [bundled, source] = await Promise.all([
    readFile(bundledPath),
    readFile(sourcePath),
  ]);
  if (!bundled.equals(source)) {
    errors.push(
      `${version}: ${path.basename(bundledPath)} differs from contract source`,
    );
  }
}
