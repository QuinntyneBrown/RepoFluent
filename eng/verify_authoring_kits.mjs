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
  "contracts/curriculum.schema.json",
  "contracts/ICD.md",
  "examples/valid/order-processing.json",
  "examples/invalid/missing-title.json",
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
    ["scripts/validate.mjs", "scripts/curriculum.validator.mjs"].map(
      (relativePath) => readFile(path.join(releaseRoot, relativePath), "utf8"),
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
    ],
    {
      cwd: releaseRoot,
      encoding: "utf8",
      env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
    },
  );
  if (valid.status !== 0 || JSON.parse(valid.stdout).valid !== true) {
    errors.push(`${version}: representative package did not validate offline`);
  }

  const invalid = spawnSync(
    process.execPath,
    [
      path.join(releaseRoot, "scripts", "validate.mjs"),
      path.join(releaseRoot, "examples", "invalid", "missing-title.json"),
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
