import { readFile } from "node:fs/promises";
import path from "node:path";
import validatePackage from "./curriculum.validator.mjs";

const packageArgument = process.argv[2];
if (!packageArgument) {
  console.error("Usage: node scripts/validate.mjs <package.json>");
  process.exit(2);
}

const packagePath = path.resolve(process.cwd(), packageArgument);
let packageValue;
try {
  packageValue = JSON.parse(await readFile(packagePath, "utf8"));
} catch {
  console.log(
    JSON.stringify({
      valid: false,
      issues: [
        {
          code: "AAK_INVALID_JSON",
          severity: "error",
          isBlocking: true,
          path: "/",
          message: "The package is not valid UTF-8 JSON.",
        },
      ],
    }),
  );
  process.exit(1);
}

const valid = validatePackage(packageValue);
const issues = valid ? [] : (validatePackage.errors ?? []).map(toIssue);
console.log(JSON.stringify({ valid, issues }));
if (!valid) process.exitCode = 1;

function toIssue(error) {
  const path =
    error.keyword === "required"
      ? `${error.instancePath}/${escapePointer(error.params.missingProperty)}`
      : error.instancePath || "/";
  return {
    code: `AAK_SCHEMA_${error.keyword.replaceAll(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`,
    severity: "error",
    isBlocking: true,
    path,
    message: "Package data does not satisfy the bundled curriculum schema.",
  };
}

function escapePointer(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}
