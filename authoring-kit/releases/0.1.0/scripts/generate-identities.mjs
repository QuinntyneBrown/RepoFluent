import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const inputArgument = process.argv[2];
if (!inputArgument) {
  console.error(
    "Usage: node scripts/generate-identities.mjs <identities.json>",
  );
  process.exit(2);
}

const inputPath = path.resolve(process.cwd(), inputArgument);
let input;
try {
  input = JSON.parse(await readFile(inputPath, "utf8"));
} catch {
  printAndExit({
    valid: false,
    namespace: null,
    entities: [],
    findings: [
      finding(
        "AAK_IDENTITY_INPUT_INVALID",
        "/",
        "The identity input is not valid UTF-8 JSON.",
      ),
    ],
  });
}

const findings = [];
const namespace = validateNamespace(input?.namespace, findings);
const entities = [];
const generated = new Map();
const supportedKinds = new Set([
  "package",
  "system",
  "course",
  "lesson",
  "objective",
  "code-reference",
  "assessment",
]);

if (!Array.isArray(input?.entities) || input.entities.length === 0) {
  findings.push(
    finding(
      "AAK_IDENTITY_INPUT_REQUIRED",
      "/entities",
      "At least one semantic entity is required.",
    ),
  );
} else if (namespace) {
  for (let index = 0; index < input.entities.length; index++) {
    const entity = input.entities[index];
    const pointer = `/entities/${index}`;
    if (!supportedKinds.has(entity?.kind)) {
      findings.push(
        finding(
          "AAK_IDENTITY_KIND_UNSUPPORTED",
          `${pointer}/kind`,
          "The entity kind is not supported by identity procedure 0.1.0.",
        ),
      );
      continue;
    }
    const semanticKey = normalize(entity?.semanticKey);
    const semanticFingerprint = normalize(entity?.semanticFingerprint);
    if (!semanticKey || !semanticFingerprint) {
      findings.push(
        finding(
          "AAK_IDENTITY_INPUT_REQUIRED",
          pointer,
          "Semantic key and fingerprint are required independently of display text.",
        ),
      );
      continue;
    }

    const canonicalIdentity = [
      namespace.organization,
      namespace.product,
      namespace.sourceScopeId,
      String(namespace.majorVersion),
      entity.kind,
      semanticKey,
    ].join("\u001f");
    const id = `rf-${prefixFor(entity.kind)}-${createHash("sha256")
      .update(canonicalIdentity)
      .digest("hex")
      .slice(0, 20)}`;
    const prior = generated.get(id);
    if (prior && prior.semanticFingerprint !== semanticFingerprint) {
      findings.push(
        finding(
          "AAK_IDENTITY_COLLISION",
          `${pointer}/semanticKey`,
          "One stable namespace key identifies distinct semantic entities; generation stopped.",
        ),
      );
      continue;
    }
    generated.set(id, { semanticFingerprint, pointer });
    entities.push({ kind: entity.kind, semanticKey, id });
  }
}

printAndExit({
  valid: findings.length === 0,
  namespace,
  entities,
  findings,
});

function validateNamespace(value, issues) {
  const namespace = {
    organization: normalize(value?.organization),
    product: normalize(value?.product),
    sourceScopeId: normalize(value?.sourceScopeId),
    majorVersion: value?.majorVersion,
  };
  if (
    !namespace.organization ||
    !namespace.product ||
    !namespace.sourceScopeId ||
    !Number.isInteger(namespace.majorVersion) ||
    namespace.majorVersion < 1
  ) {
    issues.push(
      finding(
        "AAK_IDENTITY_NAMESPACE_REQUIRED",
        "/namespace",
        "Organization, product, source scope, and positive major version form the namespace.",
      ),
    );
    return null;
  }
  return namespace;
}

function normalize(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9._/-]/g, "")
    .replaceAll(/-+/g, "-");
}

function prefixFor(kind) {
  return {
    package: "pkg",
    system: "sys",
    course: "crs",
    lesson: "lsn",
    objective: "obj",
    "code-reference": "code",
    assessment: "asm",
  }[kind];
}

function finding(code, pointer, message) {
  return { code, severity: "error", isBlocking: true, path: pointer, message };
}

function printAndExit(result) {
  console.log(JSON.stringify(result));
  process.exit(result.valid ? 0 : 1);
}
