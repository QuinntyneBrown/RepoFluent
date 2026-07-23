import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [reportArgument, scopeArgument] = process.argv.slice(2);
if (!reportArgument || !scopeArgument) {
  console.error(
    "Usage: node scripts/validate-evidence.mjs <evidence-report.json> <scope.json>",
  );
  process.exit(2);
}

const reportPath = path.resolve(process.cwd(), reportArgument);
const scopePath = path.resolve(process.cwd(), scopeArgument);
const findings = [];
const report = await readJson(reportPath, "/");
const scopeDeclaration = await readJson(scopePath, "/scope");
const preflight = runPreflight(scopePath);

if (!report || !scopeDeclaration || !preflight) {
  printAndExit(emptyResult(findings));
}

if (!preflight.valid) {
  findings.push(...preflight.findings);
  printAndExit(emptyResult(findings, preflight.scopeId));
}

if (report.scopeId !== preflight.scopeId) {
  findings.push(
    finding(
      "AAK_EVIDENCE_SCOPE_MISMATCH",
      "/scopeId",
      "The evidence report does not identify the preflight-approved source scope.",
    ),
  );
}

const repositoryReports = new Map(
  preflight.repositories.map((repository) => [repository.id, repository]),
);
const repositoryDeclarations = new Map(
  scopeDeclaration.repositories.map((repository) => [
    repository.id,
    repository,
  ]),
);
const fileCache = new Map();
const citedPaths = new Set();
const claimIds = new Set();
const claimCounts = {
  directEvidence: 0,
  synthesis: 0,
  interpretation: 0,
};

if (!Array.isArray(report.claims) || report.claims.length === 0) {
  findings.push(
    finding(
      "AAK_EVIDENCE_REQUIRED",
      "/claims",
      "At least one source-associated claim is required.",
    ),
  );
} else {
  for (let index = 0; index < report.claims.length; index++) {
    const claim = report.claims[index];
    const pointer = `/claims/${index}`;
    requireString(claim?.id, `${pointer}/id`, findings);
    requireString(claim?.statement, `${pointer}/statement`, findings);
    if (typeof claim?.id === "string") {
      if (claimIds.has(claim.id)) {
        findings.push(
          finding(
            "AAK_EVIDENCE_DUPLICATE_ID",
            `${pointer}/id`,
            "Evidence identifiers are unique within a report.",
          ),
        );
      }
      claimIds.add(claim.id);
    }

    const countKey = classificationKey(claim?.classification);
    if (!countKey) {
      findings.push(
        finding(
          "AAK_CLAIM_CLASSIFICATION_REQUIRED",
          `${pointer}/classification`,
          "Claim classification is direct-evidence, synthesis, or interpretation.",
        ),
      );
    } else {
      claimCounts[countKey] += 1;
    }

    requireStringArray(
      claim?.objectiveIds,
      `${pointer}/objectiveIds`,
      findings,
    );
    if (!Array.isArray(claim?.citations) || claim.citations.length === 0) {
      findings.push(
        finding(
          "AAK_CITATION_REQUIRED",
          `${pointer}/citations`,
          "Every claim requires at least one snapshot-bound citation.",
        ),
      );
    } else {
      for (
        let citationIndex = 0;
        citationIndex < claim.citations.length;
        citationIndex++
      ) {
        await validateCitation(
          claim.citations[citationIndex],
          `${pointer}/citations/${citationIndex}`,
        );
      }
    }
  }
}

const uncertaintyCounts = {
  assumptions: 0,
  conflicts: 0,
  missingContext: 0,
  omissions: 0,
  unresolvedQuestions: 0,
  materialRepresentations: 0,
};
const uncertainty = report.uncertainty;
if (!uncertainty || !isConfidence(uncertainty.overallConfidence)) {
  findings.push(
    finding(
      "AAK_UNCERTAINTY_REQUIRED",
      "/uncertainty/overallConfidence",
      "The uncertainty report requires an overall confidence value.",
    ),
  );
}

for (const collectionName of [
  "assumptions",
  "conflicts",
  "missingContext",
  "omissions",
  "unresolvedQuestions",
]) {
  const entries = uncertainty?.[collectionName];
  const collectionPointer = `/uncertainty/${collectionName}`;
  if (!Array.isArray(entries)) {
    findings.push(
      finding(
        "AAK_UNCERTAINTY_REQUIRED",
        collectionPointer,
        "Every structured uncertainty collection is required, including an empty array.",
      ),
    );
    continue;
  }
  uncertaintyCounts[collectionName] = entries.length;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const pointer = `${collectionPointer}/${index}`;
    requireString(entry?.id, `${pointer}/id`, findings);
    requireString(entry?.summary, `${pointer}/summary`, findings);
    if (!isConfidence(entry?.confidence)) {
      findings.push(
        finding(
          "AAK_UNCERTAINTY_REQUIRED",
          `${pointer}/confidence`,
          "Each uncertainty entry requires high, medium, or low confidence.",
        ),
      );
    }
    if (typeof entry?.material !== "boolean") {
      findings.push(
        finding(
          "AAK_UNCERTAINTY_REQUIRED",
          `${pointer}/material`,
          "Each uncertainty entry declares whether it is material.",
        ),
      );
    }
    requireStringArray(
      entry?.relatedClaimIds,
      `${pointer}/relatedClaimIds`,
      findings,
    );
    if (Array.isArray(entry?.relatedClaimIds)) {
      for (
        let claimIndex = 0;
        claimIndex < entry.relatedClaimIds.length;
        claimIndex++
      ) {
        if (!claimIds.has(entry.relatedClaimIds[claimIndex])) {
          findings.push(
            finding(
              "AAK_UNCERTAINTY_CLAIM_UNKNOWN",
              `${pointer}/relatedClaimIds/${claimIndex}`,
              "The uncertainty entry references an unknown claim.",
            ),
          );
        }
      }
    }

    if (!Array.isArray(entry?.packageRepresentations)) {
      findings.push(
        finding(
          "AAK_UNCERTAINTY_REQUIRED",
          `${pointer}/packageRepresentations`,
          "Package representations are required, including an empty array.",
        ),
      );
    } else if (entry.material && entry.packageRepresentations.length === 0) {
      findings.push(
        finding(
          "AAK_UNCERTAINTY_UNREPRESENTED",
          `${pointer}/packageRepresentations`,
          "Material uncertainty requires a learner- or reviewer-visible package representation.",
        ),
      );
    } else {
      for (
        let representationIndex = 0;
        representationIndex < entry.packageRepresentations.length;
        representationIndex++
      ) {
        const representation =
          entry.packageRepresentations[representationIndex];
        const representationPointer = `${pointer}/packageRepresentations/${representationIndex}`;
        requireString(
          representation?.entityType,
          `${representationPointer}/entityType`,
          findings,
        );
        requireString(
          representation?.entityId,
          `${representationPointer}/entityId`,
          findings,
        );
        requireString(
          representation?.field,
          `${representationPointer}/field`,
          findings,
        );
      }
      if (entry.material) {
        uncertaintyCounts.materialRepresentations +=
          entry.packageRepresentations.length;
      }
    }

    if (!Array.isArray(entry?.citations)) {
      findings.push(
        finding(
          "AAK_UNCERTAINTY_REQUIRED",
          `${pointer}/citations`,
          "Uncertainty citations are required, including an empty array.",
        ),
      );
    } else {
      if (collectionName === "conflicts" && entry.citations.length < 2) {
        findings.push(
          finding(
            "AAK_CONFLICT_EVIDENCE_REQUIRED",
            `${pointer}/citations`,
            "A conflict requires at least two snapshot-bound citations.",
          ),
        );
      }
      for (
        let citationIndex = 0;
        citationIndex < entry.citations.length;
        citationIndex++
      ) {
        await validateCitation(
          entry.citations[citationIndex],
          `${pointer}/citations/${citationIndex}`,
        );
      }
    }
  }
}

printAndExit({
  valid: findings.length === 0,
  scopeId: preflight.scopeId,
  claims: claimCounts,
  uncertainty: uncertaintyCounts,
  citedPaths: [...citedPaths].sort(),
  findings,
});

async function validateCitation(citation, pointer) {
  const repository = repositoryReports.get(citation?.repositoryId);
  const declaration = repositoryDeclarations.get(citation?.repositoryId);
  if (!repository || !declaration) {
    findings.push(
      finding(
        "AAK_CITATION_SCOPE_MISMATCH",
        `${pointer}/repositoryId`,
        "The citation repository is absent from the approved source scope.",
      ),
    );
    return;
  }
  if (citation.revision !== repository.revision) {
    findings.push(
      finding(
        "AAK_CITATION_SNAPSHOT_MISMATCH",
        `${pointer}/revision`,
        "The citation revision differs from the approved source snapshot.",
      ),
    );
  }
  if (!repository.effectiveFiles.includes(citation.path)) {
    findings.push(
      finding(
        "AAK_CITATION_SCOPE_MISMATCH",
        `${pointer}/path`,
        "The citation path is absent from the preflight-approved effective files.",
      ),
    );
    return;
  }

  citedPaths.add(citation.path);
  const cacheKey = `${citation.repositoryId}:${citation.path}`;
  let source = fileCache.get(cacheKey);
  if (!source) {
    const repositoryRoot = path.resolve(
      path.dirname(scopePath),
      declaration.root,
    );
    const sourcePath = path.join(repositoryRoot, ...citation.path.split("/"));
    const bytes = await readFile(sourcePath);
    source = {
      hash: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      lineCount: bytes.toString("utf8").split(/\r?\n/).length,
    };
    fileCache.set(cacheKey, source);
  }

  if (citation.sourceSha256 !== source.hash) {
    findings.push(
      finding(
        "AAK_CITATION_HASH_MISMATCH",
        `${pointer}/sourceSha256`,
        "The cited source bytes differ from the report snapshot hash.",
      ),
    );
  }
  const locator = citation.locator;
  if (
    locator?.kind !== "line-range" ||
    !Number.isInteger(locator.startLine) ||
    !Number.isInteger(locator.endLine) ||
    locator.startLine < 1 ||
    locator.endLine < locator.startLine ||
    locator.endLine > source.lineCount
  ) {
    findings.push(
      finding(
        "AAK_CITATION_LOCATOR_INVALID",
        `${pointer}/locator`,
        "The citation locator is a valid one-based line range in the cited source.",
      ),
    );
  }
}

function runPreflight(targetScopePath) {
  const commandPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "preflight.mjs",
  );
  const result = spawnSync(process.execPath, [commandPath, targetScopePath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, REPOFLUENT_OFFLINE: "true" },
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    findings.push(
      finding(
        "AAK_EVIDENCE_PREFLIGHT_FAILED",
        "/scope",
        "Scope preflight did not return a readable report.",
      ),
    );
    return null;
  }
}

async function readJson(filePath, pointer) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    findings.push(
      finding(
        "AAK_EVIDENCE_INVALID",
        pointer,
        "The evidence input is not valid UTF-8 JSON.",
      ),
    );
    return null;
  }
}

function requireString(value, pointer, issues) {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(
      finding(
        "AAK_EVIDENCE_REQUIRED",
        pointer,
        "A nonempty evidence value is required.",
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
        "AAK_EVIDENCE_REQUIRED",
        pointer,
        "A nonempty evidence list is required.",
      ),
    );
  }
}

function classificationKey(value) {
  return {
    "direct-evidence": "directEvidence",
    synthesis: "synthesis",
    interpretation: "interpretation",
  }[value];
}

function isConfidence(value) {
  return ["high", "medium", "low"].includes(value);
}

function finding(code, pointer, message) {
  return { code, severity: "error", isBlocking: true, path: pointer, message };
}

function emptyResult(issues, scopeId = "unknown") {
  return {
    valid: false,
    scopeId,
    claims: { directEvidence: 0, synthesis: 0, interpretation: 0 },
    uncertainty: {
      assumptions: 0,
      conflicts: 0,
      missingContext: 0,
      omissions: 0,
      unresolvedQuestions: 0,
      materialRepresentations: 0,
    },
    citedPaths: [],
    findings: issues,
  };
}

function printAndExit(result) {
  console.log(JSON.stringify(result));
  process.exit(result.valid ? 0 : 1);
}
