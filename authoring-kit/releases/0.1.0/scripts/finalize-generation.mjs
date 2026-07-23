import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [runArgument, packageArgument] = process.argv.slice(2);
if (!runArgument || !packageArgument) {
  console.error(
    "Usage: node scripts/finalize-generation.mjs <completed-run.json> <package.json>",
  );
  process.exit(2);
}

const runPath = path.resolve(process.cwd(), runArgument);
const packagePath = path.resolve(process.cwd(), packageArgument);
const releaseRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const findings = [];
let run;
let packageBytes;
try {
  [run, packageBytes] = await Promise.all([
    readFile(runPath, "utf8").then(JSON.parse),
    readFile(packagePath),
  ]);
} catch {
  printFailure([
    finding(
      "AAK_GENERATION_INPUT_INVALID",
      "/",
      "The completed run and package are required as readable local files.",
    ),
  ]);
}

validateRun(run, findings);
if (findings.length > 0) printFailure(findings);

const validation = spawnSync(
  process.execPath,
  [path.join(releaseRoot, "scripts", "validate.mjs"), packagePath],
  {
    cwd: releaseRoot,
    encoding: "utf8",
    env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
  },
);
let validationReport;
try {
  validationReport = JSON.parse(validation.stdout);
} catch {
  printFailure([
    finding(
      "AAK_GENERATION_VALIDATION_FAILED",
      "/validation",
      "The local package validator did not return a readable result.",
    ),
  ]);
}

const manifest = {
  manifestVersion: run.manifestVersion,
  tool: { id: run.tool.id, version: run.tool.version },
  model: run.model ? { id: run.model.id, version: run.model.version } : null,
  kitVersion: run.kitVersion,
  contractVersion: run.contractVersion,
  sourceSnapshot: {
    scopeId: run.sourceSnapshot.scopeId,
    repositories: run.sourceSnapshot.repositories.map((repository) => ({
      id: repository.id,
      revision: repository.revision,
    })),
  },
  startedAt: run.startedAt,
  completedAt: run.completedAt,
  package: {
    path: path.relative(releaseRoot, packagePath).split(path.sep).join("/"),
    sha256: `sha256:${createHash("sha256").update(packageBytes).digest("hex")}`,
  },
  inputs: {
    identityInput: run.identityInput,
    evidenceReport: run.evidenceReport,
  },
  options: sanitize(run.options),
  validation: {
    valid: validationReport.valid === true,
    issueCount: Array.isArray(validationReport.issues)
      ? validationReport.issues.length
      : 0,
  },
};

console.log(JSON.stringify(manifest));
process.exit(validation.status === 0 && manifest.validation.valid ? 0 : 1);

function validateRun(value, issues) {
  requireString(value?.manifestVersion, "/manifestVersion", issues);
  requireString(value?.tool?.id, "/tool/id", issues);
  requireString(value?.tool?.version, "/tool/version", issues);
  if (value?.model !== null && value?.model !== undefined) {
    requireString(value.model.id, "/model/id", issues);
    requireString(value.model.version, "/model/version", issues);
  }
  requireString(value?.kitVersion, "/kitVersion", issues);
  requireString(value?.contractVersion, "/contractVersion", issues);
  requireString(
    value?.sourceSnapshot?.scopeId,
    "/sourceSnapshot/scopeId",
    issues,
  );
  if (
    !Array.isArray(value?.sourceSnapshot?.repositories) ||
    value.sourceSnapshot.repositories.length === 0
  ) {
    issues.push(
      finding(
        "AAK_GENERATION_INPUT_REQUIRED",
        "/sourceSnapshot/repositories",
        "At least one source repository and revision are required.",
      ),
    );
  } else {
    for (
      let index = 0;
      index < value.sourceSnapshot.repositories.length;
      index++
    ) {
      requireString(
        value.sourceSnapshot.repositories[index]?.id,
        `/sourceSnapshot/repositories/${index}/id`,
        issues,
      );
      requireString(
        value.sourceSnapshot.repositories[index]?.revision,
        `/sourceSnapshot/repositories/${index}/revision`,
        issues,
      );
    }
  }
  requireTimestamp(value?.startedAt, "/startedAt", issues);
  requireTimestamp(value?.completedAt, "/completedAt", issues);
  if (
    typeof value?.startedAt === "string" &&
    typeof value?.completedAt === "string" &&
    Date.parse(value.completedAt) < Date.parse(value.startedAt)
  ) {
    issues.push(
      finding(
        "AAK_GENERATION_TIME_INVALID",
        "/completedAt",
        "Generation completion time does not precede start time.",
      ),
    );
  }
  requireString(value?.identityInput, "/identityInput", issues);
  requireString(value?.evidenceReport, "/evidenceReport", issues);
  if (
    !value?.options ||
    typeof value.options !== "object" ||
    Array.isArray(value.options)
  ) {
    issues.push(
      finding(
        "AAK_GENERATION_INPUT_REQUIRED",
        "/options",
        "Declared generation options are required.",
      ),
    );
  }
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !/(?:chain.?of.?thought|credential|secret|password|token|full.?prompt|prompt.?transcript)/i.test(
            key,
          ),
      )
      .map(([key, child]) => [key, sanitize(child)]),
  );
}

function requireString(value, pointer, issues) {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(
      finding(
        "AAK_GENERATION_INPUT_REQUIRED",
        pointer,
        "A nonempty generation value is required.",
      ),
    );
  }
}

function requireTimestamp(value, pointer, issues) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    issues.push(
      finding(
        "AAK_GENERATION_TIME_INVALID",
        pointer,
        "A valid generation timestamp is required.",
      ),
    );
  }
}

function finding(code, pointer, message) {
  return { code, severity: "error", isBlocking: true, path: pointer, message };
}

function printFailure(issues) {
  console.log(JSON.stringify({ valid: false, findings: issues }));
  process.exit(1);
}
