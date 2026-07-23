import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const profiles = {
  dotnet: [
    "solution-project-structure",
    "application-boundaries",
    "dependency-injection",
    "controllers-endpoints",
    "domain-services",
    "persistence",
    "messaging",
    "configuration",
    "background-workers",
    "external-clients",
    "tests",
  ],
  angular: [
    "application-bootstrap",
    "route-boundaries",
    "components-modules",
    "services",
    "dependency-injection",
    "state-flow",
    "http-integration",
    "guards-interceptors",
    "templates",
    "configuration",
    "tests",
  ],
};

const [profileArgument, reportArgument] = process.argv.slice(2);
if (!Object.hasOwn(profiles, profileArgument) || !reportArgument) {
  console.log(
    JSON.stringify({
      valid: false,
      findings: [
        finding(
          "AAK_ANALYSIS_INVOCATION",
          "/",
          "Usage requires profile dotnet or angular and one local analysis report.",
        ),
      ],
    }),
  );
  process.exit(2);
}

const releaseRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
let report;
try {
  report = JSON.parse(
    await readFile(path.resolve(process.cwd(), reportArgument), "utf8"),
  );
} catch {
  fail([
    finding(
      "AAK_ANALYSIS_REPORT_INVALID",
      "/",
      "The analysis report must be readable local JSON.",
    ),
  ]);
}

const findings = [];
if (report?.analysisVersion !== "0.1.0") {
  findings.push(
    finding(
      "AAK_ANALYSIS_VERSION_UNSUPPORTED",
      "/analysisVersion",
      "The analysis report version is not supported.",
    ),
  );
}
if (report?.profile !== profileArgument) {
  findings.push(
    finding(
      "AAK_ANALYSIS_PROFILE_MISMATCH",
      "/profile",
      "The selected profile does not match the analysis report.",
    ),
  );
}

const repositoryRoot = resolveRepositoryRoot(report?.repositoryRoot, findings);
const expectedCategories = profiles[profileArgument];
const coverage = Array.isArray(report?.coverage) ? report.coverage : [];
const categoryCounts = new Map();
const citedPaths = new Set();
for (let index = 0; index < coverage.length; index++) {
  const entry = coverage[index];
  const category = entry?.category;
  categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  await validateEvidence(
    entry?.evidence,
    `/coverage/${index}/evidence`,
    repositoryRoot,
    findings,
    citedPaths,
  );
}
for (const category of expectedCategories) {
  if (categoryCounts.get(category) !== 1) {
    findings.push(
      finding(
        "AAK_ANALYSIS_COVERAGE_REQUIRED",
        "/coverage",
        `Exactly one ${category} evidence entry is required.`,
      ),
    );
  }
}
for (const category of categoryCounts.keys()) {
  if (!expectedCategories.includes(category)) {
    findings.push(
      finding(
        "AAK_ANALYSIS_CATEGORY_UNSUPPORTED",
        "/coverage",
        "The analysis report contains an unsupported coverage category.",
      ),
    );
  }
}

const unresolvedBehaviors = Array.isArray(report?.unresolvedBehaviors)
  ? report.unresolvedBehaviors
  : [];
for (let index = 0; index < unresolvedBehaviors.length; index++) {
  const unresolved = unresolvedBehaviors[index];
  if (
    unresolved?.code !== "AAK_DYNAMIC_BEHAVIOR_UNRESOLVED" ||
    typeof unresolved?.explanation !== "string" ||
    unresolved.explanation.trim().length === 0
  ) {
    findings.push(
      finding(
        "AAK_ANALYSIS_UNRESOLVED_INVALID",
        `/unresolvedBehaviors/${index}`,
        "Unresolved behavior requires the stable code and a safe explanation.",
      ),
    );
  }
  await validateEvidence(
    unresolved?.evidence,
    `/unresolvedBehaviors/${index}/evidence`,
    repositoryRoot,
    findings,
    citedPaths,
  );
}
if (profileArgument === "dotnet" && unresolvedBehaviors.length === 0) {
  findings.push(
    finding(
      "AAK_ANALYSIS_UNRESOLVED_REQUIRED",
      "/unresolvedBehaviors",
      "The representative dynamic registration must remain unresolved.",
    ),
  );
}

const flow = Array.isArray(report?.flow) ? report.flow : [];
if (profileArgument === "angular" && flow.length !== 5) {
  findings.push(
    finding(
      "AAK_ANALYSIS_FLOW_REQUIRED",
      "/flow",
      "The Angular report requires five source-supported user-to-API steps.",
    ),
  );
}
for (let index = 0; index < flow.length; index++) {
  if (
    typeof flow[index]?.step !== "string" ||
    flow[index].step.trim().length === 0
  ) {
    findings.push(
      finding(
        "AAK_ANALYSIS_FLOW_INVALID",
        `/flow/${index}/step`,
        "Every flow step requires a safe description.",
      ),
    );
  }
  await validateEvidence(
    flow[index]?.evidence,
    `/flow/${index}/evidence`,
    repositoryRoot,
    findings,
    citedPaths,
  );
}

if (findings.length > 0) fail(findings);

console.log(
  JSON.stringify({
    valid: true,
    profile: profileArgument,
    coverage: coverage.length,
    unresolvedBehaviorCount: unresolvedBehaviors.length,
    flowSteps: flow.length,
    citedPaths: [...citedPaths].sort(),
  }),
);

function resolveRepositoryRoot(value, findings) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    path.isAbsolute(value) ||
    value.split(/[\\/]/).includes("..")
  ) {
    findings.push(
      finding(
        "AAK_ANALYSIS_REPOSITORY_INVALID",
        "/repositoryRoot",
        "The repository root must be a release-relative local directory.",
      ),
    );
    return null;
  }
  const resolved = path.resolve(releaseRoot, value);
  const relative = path.relative(releaseRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

async function validateEvidence(
  evidence,
  pointer,
  repositoryRoot,
  findings,
  citedPaths,
) {
  if (
    !repositoryRoot ||
    typeof evidence?.path !== "string" ||
    evidence.path.length === 0 ||
    path.isAbsolute(evidence.path) ||
    evidence.path.split(/[\\/]/).includes("..") ||
    typeof evidence?.locator !== "string" ||
    evidence.locator.trim().length === 0
  ) {
    findings.push(
      finding(
        "AAK_ANALYSIS_EVIDENCE_INVALID",
        pointer,
        "Analysis evidence requires a local relative path and stable locator.",
      ),
    );
    return;
  }
  const sourcePath = path.resolve(repositoryRoot, evidence.path);
  const relative = path.relative(repositoryRoot, sourcePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    findings.push(
      finding(
        "AAK_ANALYSIS_EVIDENCE_INVALID",
        `${pointer}/path`,
        "Analysis evidence must remain inside the declared repository.",
      ),
    );
    return;
  }
  try {
    await readFile(sourcePath);
    citedPaths.add(evidence.path.split(path.sep).join("/"));
  } catch {
    findings.push(
      finding(
        "AAK_ANALYSIS_SOURCE_MISSING",
        `${pointer}/path`,
        "The cited analysis source is not present in the supplied snapshot.",
      ),
    );
  }
}

function finding(code, pointer, message) {
  return {
    code,
    severity: "error",
    isBlocking: true,
    path: pointer,
    message,
  };
}

function fail(findings) {
  console.log(JSON.stringify({ valid: false, findings }));
  process.exit(1);
}
