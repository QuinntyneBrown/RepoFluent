import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

const scopeArgument = process.argv[2];
if (!scopeArgument) {
  console.error("Usage: node scripts/preflight.mjs <scope.json>");
  process.exit(2);
}

const scopePath = path.resolve(process.cwd(), scopeArgument);
let scope;
try {
  scope = JSON.parse(await readFile(scopePath, "utf8"));
} catch {
  printAndExit({
    valid: false,
    scopeId: "unknown",
    repositories: [],
    findings: [
      finding(
        "AAK_SCOPE_INVALID",
        "/",
        "The source scope is not valid UTF-8 JSON.",
      ),
    ],
  });
}

const findings = validateDeclaration(scope);
const repositoryReports = [];
if (findings.length === 0) {
  for (let index = 0; index < scope.repositories.length; index++) {
    repositoryReports.push(
      await inspectRepository(
        scope.repositories[index],
        index,
        path.dirname(scopePath),
        findings,
      ),
    );
  }
}

printAndExit({
  valid: findings.length === 0,
  scopeId: typeof scope.scopeId === "string" ? scope.scopeId : "unknown",
  outputLocation:
    typeof scope.outputLocation === "string" ? scope.outputLocation : null,
  repositories: repositoryReports,
  findings,
});

async function inspectRepository(repository, index, scopeDirectory, findings) {
  const repositoryRoot = path.resolve(scopeDirectory, repository.root);
  let canonicalRoot;
  try {
    canonicalRoot = await realpath(repositoryRoot);
  } catch {
    findings.push(
      finding(
        "AAK_SCOPE_SOURCE_UNAVAILABLE",
        `/repositories/${index}/root`,
        "An approved repository root is unavailable.",
      ),
    );
    return emptyRepositoryReport(repository);
  }

  const files = await walkFiles(canonicalRoot, canonicalRoot, findings, index);
  const guidanceOrder = files
    .filter((file) => path.posix.basename(file) === "AGENTS.md")
    .sort(compareGuidance);
  const policies = [];
  for (const guidancePath of guidanceOrder) {
    const policy = await readPolicy(
      path.join(canonicalRoot, ...guidancePath.split("/")),
    );
    if (policy) {
      policies.push({
        path: guidancePath,
        directory:
          path.posix.dirname(guidancePath) === "."
            ? ""
            : path.posix.dirname(guidancePath),
        ...policy,
      });
    }
  }

  const effectiveFiles = [];
  const exclusions = [];
  for (const file of files) {
    if (path.posix.basename(file) === "AGENTS.md") continue;
    if (!repository.include.some((pattern) => matchesGlob(pattern, file)))
      continue;

    if (repository.exclude.some((pattern) => matchesGlob(pattern, file))) {
      exclusions.push({
        path: file,
        guidance: "scope declaration",
        reason: "Explicit scope exclusion",
      });
      continue;
    }

    const policyExclusion = findPolicyExclusion(file, policies);
    if (policyExclusion) {
      exclusions.push(policyExclusion);
      continue;
    }

    effectiveFiles.push(file);
  }

  for (const document of repository.documents) {
    if (!effectiveFiles.includes(document)) {
      findings.push(
        finding(
          "AAK_SCOPE_DOCUMENT_UNAVAILABLE",
          `/repositories/${index}/documents`,
          "A declared document is absent or excluded by applicable guidance.",
        ),
      );
    }
  }

  if (scope.dataHandling.secretScanning) {
    for (const file of effectiveFiles) {
      const content = await readSafeText(
        path.join(canonicalRoot, ...file.split("/")),
      );
      if (content !== null && containsSuspectedSecret(content)) {
        findings.push(
          finding(
            "AAK_SECRET_SUSPECTED",
            file,
            "A suspected credential pattern was found. Source analysis stopped.",
          ),
        );
      }
    }
  }

  return {
    id: repository.id,
    revision: repository.revision,
    guidanceOrder,
    effectiveFiles: effectiveFiles.sort(),
    exclusions: exclusions.sort((left, right) =>
      left.path.localeCompare(right.path),
    ),
  };
}

function validateDeclaration(value) {
  const issues = [];
  if (!value || typeof value !== "object") {
    return [
      finding(
        "AAK_SCOPE_REQUIRED",
        "/",
        "A source scope declaration is required.",
      ),
    ];
  }
  requireString(value.scopeVersion, "/scopeVersion", issues);
  requireString(value.scopeId, "/scopeId", issues);
  requireString(value.outputLocation, "/outputLocation", issues);
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) {
    issues.push(
      finding(
        "AAK_SCOPE_REQUIRED",
        "/repositories",
        "At least one approved repository is required.",
      ),
    );
  } else {
    for (let index = 0; index < value.repositories.length; index++) {
      const repository = value.repositories[index];
      requireString(repository?.id, `/repositories/${index}/id`, issues);
      requireString(repository?.root, `/repositories/${index}/root`, issues);
      requireString(
        repository?.revision,
        `/repositories/${index}/revision`,
        issues,
      );
      requireStringArray(
        repository?.documents,
        `/repositories/${index}/documents`,
        issues,
      );
      requireStringArray(
        repository?.include,
        `/repositories/${index}/include`,
        issues,
      );
      if (!Array.isArray(repository?.exclude)) {
        issues.push(
          finding(
            "AAK_SCOPE_REQUIRED",
            `/repositories/${index}/exclude`,
            "Explicit exclusions are required, including an empty array when none apply.",
          ),
        );
      }
    }
  }
  if (
    !value.dataHandling ||
    value.dataHandling.secretScanning !== true ||
    value.dataHandling.excerptPolicy !== "minimum-necessary" ||
    !Array.isArray(value.dataHandling.redact) ||
    !value.dataHandling.redact.includes("secrets")
  ) {
    issues.push(
      finding(
        "AAK_DATA_HANDLING_REQUIRED",
        "/dataHandling",
        "Minimum excerpts, secret redaction, and secret scanning are required.",
      ),
    );
  }
  return issues;
}

async function walkFiles(root, current, findings, repositoryIndex) {
  const results = [];
  for (const entry of (await readdir(current, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name),
  )) {
    const fullPath = path.join(current, entry.name);
    const relativePath = path
      .relative(root, fullPath)
      .split(path.sep)
      .join("/");
    const stats = await lstat(fullPath);
    if (stats.isSymbolicLink()) {
      findings.push(
        finding(
          "AAK_SCOPE_SYMLINK_BLOCKED",
          `/repositories/${repositoryIndex}/root`,
          `A symbolic link was not traversed: ${relativePath}`,
        ),
      );
    } else if (stats.isDirectory()) {
      results.push(
        ...(await walkFiles(root, fullPath, findings, repositoryIndex)),
      );
    } else if (stats.isFile()) {
      results.push(relativePath);
    }
  }
  return results;
}

async function readPolicy(filePath) {
  const content = await readFile(filePath, "utf8");
  const match = /```repofluent-policy\s+([\s\S]*?)```/i.exec(content);
  if (!match) return null;
  try {
    const policy = JSON.parse(match[1]);
    return {
      analysis: policy.analysis === "deny" ? "deny" : "allow",
      exclude: Array.isArray(policy.exclude) ? policy.exclude : [],
    };
  } catch {
    return { analysis: "deny", exclude: ["**"] };
  }
}

function findPolicyExclusion(file, policies) {
  for (const policy of policies) {
    if (policy.directory && !file.startsWith(`${policy.directory}/`)) continue;
    const relative = policy.directory
      ? file.slice(policy.directory.length + 1)
      : file;
    if (
      policy.analysis === "deny" ||
      policy.exclude.some((pattern) => matchesGlob(pattern, relative))
    ) {
      return {
        path: file,
        guidance: policy.path,
        reason: "Directory guidance exclusion",
      };
    }
  }
  return null;
}

function matchesGlob(pattern, value) {
  const expression = pattern
    .split("/")
    .map((segment) => {
      if (segment === "**") return ".*";
      return segment
        .replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replaceAll("*", "[^/]*");
    })
    .join("/");
  return new RegExp(`^${expression}$`, "u").test(value);
}

async function readSafeText(filePath) {
  const bytes = await readFile(filePath);
  if (bytes.length > 1024 * 1024 || bytes.includes(0)) return null;
  return bytes.toString("utf8");
}

function containsSuspectedSecret(content) {
  return [
    /AKIA[0-9A-Z]{16}/,
    /ghp_[A-Za-z0-9]{36}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /(?:password|client_secret|access_token)\s*[:=]\s*["']?[^"'\s]{8,}/i,
  ].some((pattern) => pattern.test(content));
}

function requireString(value, pointer, issues) {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(
      finding(
        "AAK_SCOPE_REQUIRED",
        pointer,
        "A declared source-scope value is required.",
      ),
    );
  }
}

function requireStringArray(value, pointer, issues) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    issues.push(
      finding(
        "AAK_SCOPE_REQUIRED",
        pointer,
        "A nonempty declared list is required.",
      ),
    );
  }
}

function finding(code, pointer, message) {
  return { code, severity: "error", isBlocking: true, path: pointer, message };
}

function compareGuidance(left, right) {
  const depth = left.split("/").length - right.split("/").length;
  return depth || left.localeCompare(right);
}

function emptyRepositoryReport(repository) {
  return {
    id: repository?.id ?? "unknown",
    revision: repository?.revision ?? "unknown",
    guidanceOrder: [],
    effectiveFiles: [],
    exclusions: [],
  };
}

function printAndExit(report) {
  console.log(JSON.stringify(report));
  process.exit(report.valid ? 0 : 1);
}
