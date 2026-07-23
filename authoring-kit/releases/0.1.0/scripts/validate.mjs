import { readFile } from "node:fs/promises";
import path from "node:path";

const exitStatus = {
  success: 0,
  "validation-failure": 1,
  "invalid-invocation": 2,
  "warnings-only": 3,
  "internal-failure": 4,
};
const severityRank = { info: 0, warning: 1, error: 2 };
const parsed = parseArguments(process.argv.slice(2));

if (parsed.issue) {
  finish(
    report(false, "invalid-invocation", null, parsed.threshold, [parsed.issue]),
    parsed.format,
  );
}

let validatePackage;
try {
  validatePackage = (await import("./curriculum.validator.mjs")).default;
  if (typeof validatePackage !== "function") throw new TypeError();
} catch {
  finish(
    report(false, "internal-failure", null, parsed.threshold, [
      issue(
        "AAK_VALIDATOR_INTERNAL",
        "error",
        true,
        "/",
        "The bundled local validator could not be initialized.",
      ),
    ]),
    parsed.format,
  );
}

const packagePath = path.resolve(process.cwd(), parsed.packageArgument);
let packageValue;
try {
  packageValue = JSON.parse(await readFile(packagePath, "utf8"));
} catch (error) {
  const isMissing = error?.code === "ENOENT" || error?.code === "EISDIR";
  const failure = isMissing
    ? report(false, "invalid-invocation", null, parsed.threshold, [
        issue(
          "AAK_VALIDATOR_INVOCATION",
          "error",
          true,
          "/package",
          "The package path must identify a readable local JSON file.",
        ),
      ])
    : report(false, "validation-failure", null, parsed.threshold, [
        issue(
          "CIC_INVALID_JSON",
          "error",
          true,
          "/",
          "The package is not valid UTF-8 JSON.",
        ),
      ]);
  finish(failure, parsed.format);
}

const detectedVersion =
  typeof packageValue?.contractVersion === "string"
    ? packageValue.contractVersion
    : null;
const contractVersion =
  parsed.contract === "auto" ? detectedVersion : parsed.contract;
if (contractVersion !== "0.1.0") {
  const isExplicitUnsupported = parsed.contract !== "auto";
  finish(
    report(
      false,
      isExplicitUnsupported ? "invalid-invocation" : "validation-failure",
      detectedVersion,
      parsed.threshold,
      [
        issue(
          isExplicitUnsupported
            ? "AAK_VALIDATOR_INVOCATION"
            : "CIC_CONTRACT_VERSION_UNSUPPORTED",
          "error",
          true,
          isExplicitUnsupported ? "/contract" : "/contractVersion",
          isExplicitUnsupported
            ? "The requested contract version is not bundled with this release."
            : "The package contract version is not supported by this release.",
        ),
      ],
    ),
    parsed.format,
  );
}

try {
  const schemaValid = validatePackage(packageValue);
  const issues = schemaValid
    ? validateExtensionSupport(packageValue)
    : (validatePackage.errors ?? []).map(toIssue);
  const visibleIssues = issues.filter(
    (item) => severityRank[item.severity] >= severityRank[parsed.threshold],
  );
  const hasFailure = issues.some((item) => item.isBlocking);
  const hasVisibleWarning = visibleIssues.some(
    (item) => item.severity === "warning",
  );
  const outcome = hasFailure
    ? "validation-failure"
    : hasVisibleWarning
      ? "warnings-only"
      : "success";
  const result = report(
    !hasFailure,
    outcome,
    contractVersion,
    parsed.threshold,
    visibleIssues,
  );

  if (parsed.legacy) {
    console.log(JSON.stringify({ valid: result.valid, issues: result.issues }));
    process.exit(exitStatus[outcome] === 3 ? 0 : exitStatus[outcome]);
  }
  finish(result, parsed.format);
} catch {
  finish(
    report(false, "internal-failure", contractVersion, parsed.threshold, [
      issue(
        "AAK_VALIDATOR_INTERNAL",
        "error",
        true,
        "/",
        "The bundled local validator could not complete validation.",
      ),
    ]),
    parsed.format,
  );
}

function parseArguments(arguments_) {
  const packageArgument = arguments_[0];
  const values = {
    packageArgument,
    contract: "auto",
    format: "json",
    threshold: "error",
    legacy: arguments_.length === 1,
  };
  if (!packageArgument || packageArgument.startsWith("--")) {
    return {
      ...values,
      issue: invocationIssue(
        "/package",
        "Usage: node scripts/validate.mjs <package.json> [--contract auto|0.1.0] [--format json|text] [--threshold info|warning|error]",
      ),
    };
  }
  if ((arguments_.length - 1) % 2 !== 0) {
    return {
      ...values,
      issue: invocationIssue(
        "/arguments",
        "Every validator option requires one value.",
      ),
    };
  }
  for (let index = 1; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (option === "--contract") values.contract = value;
    else if (option === "--format") values.format = value;
    else if (option === "--threshold") values.threshold = value;
    else {
      return {
        ...values,
        issue: invocationIssue(
          "/arguments",
          "The validator received an unsupported option.",
        ),
      };
    }
  }
  if (!["auto", "0.1.0"].includes(values.contract)) {
    return {
      ...values,
      issue: invocationIssue(
        "/contract",
        "Contract must be auto or a bundled version.",
      ),
    };
  }
  if (!["json", "text"].includes(values.format)) {
    return {
      ...values,
      format: "json",
      issue: invocationIssue(
        "/format",
        "Output format must be json or text.",
      ),
    };
  }
  if (!Object.hasOwn(severityRank, values.threshold)) {
    return {
      ...values,
      issue: invocationIssue(
        "/threshold",
        "Severity threshold must be info, warning, or error.",
      ),
    };
  }
  return values;
}

function validateExtensionSupport(value) {
  if (!Array.isArray(value?.extensions)) return [];
  return value.extensions.map((extension, index) =>
    extension?.critical === true
      ? issue(
          "CIC_UNSUPPORTED_CRITICAL_EXTENSION",
          "error",
          true,
          `/extensions/${index}/namespace`,
          "The critical extension namespace is not supported.",
        )
      : issue(
          "CIC_EXTENSION_IGNORED",
          "warning",
          false,
          `/extensions/${index}/namespace`,
          "The unsupported noncritical extension was ignored without changing core interpretation.",
        ),
  );
}

function toIssue(error) {
  const pointer =
    error.keyword === "required"
      ? `${error.instancePath}/${escapePointer(error.params.missingProperty)}`
      : error.instancePath || "/";
  return issue(
    error.keyword === "required"
      ? "CIC_REQUIRED"
      : `AAK_SCHEMA_${error.keyword.replaceAll(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`,
    "error",
    true,
    pointer,
    "Package data does not satisfy the bundled curriculum schema.",
  );
}

function invocationIssue(pointer, message) {
  return issue(
    "AAK_VALIDATOR_INVOCATION",
    "error",
    true,
    pointer,
    message,
  );
}

function issue(code, severity, isBlocking, pointer, message) {
  return { code, severity, isBlocking, path: pointer, message };
}

function report(valid, outcome, contractVersion, threshold, issues) {
  return { valid, outcome, contractVersion, threshold, issues };
}

function finish(result, format) {
  if (format === "text") {
    console.log(
      [
        `outcome=${result.outcome}`,
        `valid=${result.valid}`,
        `contract=${result.contractVersion ?? "unknown"}`,
        `threshold=${result.threshold}`,
        ...result.issues.map(
          (item) =>
            `${item.severity} ${item.code} ${item.path} ${item.message}`,
        ),
      ].join("\n"),
    );
  } else {
    console.log(JSON.stringify(result));
  }
  process.exit(exitStatus[result.outcome]);
}

function escapePointer(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}
