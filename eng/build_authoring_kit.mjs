import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const frontendRoot = path.join(repositoryRoot, "frontend");
const releaseRoot = path.join(
  repositoryRoot,
  "authoring-kit",
  "releases",
  "0.1.0",
);
const contractRoot = path.join(
  repositoryRoot,
  "contracts",
  "curriculum",
  "0.1.0",
);
const frontendRequire = createRequire(path.join(frontendRoot, "package.json"));
const Ajv2020 = frontendRequire("ajv/dist/2020").default;
const standaloneCode = frontendRequire("ajv/dist/standalone").default;
const esbuild = frontendRequire("esbuild");

await mkdir(path.join(releaseRoot, "contracts"), { recursive: true });
await mkdir(path.join(releaseRoot, "examples", "valid"), { recursive: true });
await mkdir(path.join(releaseRoot, "examples", "invalid"), { recursive: true });
await mkdir(path.join(releaseRoot, "examples", "warnings"), {
  recursive: true,
});
await mkdir(path.join(releaseRoot, "examples", "evidence"), {
  recursive: true,
});
await mkdir(path.join(releaseRoot, "examples", "analysis"), {
  recursive: true,
});
await mkdir(path.join(releaseRoot, "scripts"), { recursive: true });

await copyFile(
  path.join(contractRoot, "curriculum.schema.json"),
  path.join(releaseRoot, "contracts", "curriculum.schema.json"),
);
await copyFile(
  path.join(contractRoot, "ICD.md"),
  path.join(releaseRoot, "contracts", "ICD.md"),
);
const warningPackage = JSON.parse(
  await readFile(
    path.join(contractRoot, "fixtures", "order-processing.json"),
    "utf8",
  ),
);
await writeFile(
  path.join(
    releaseRoot,
    "examples",
    "warnings",
    "unsupported-extension.json",
  ),
  `${JSON.stringify(warningPackage, null, 2)}\n`,
);

const validPackage = structuredClone(warningPackage);
delete validPackage.extensions;
await writeFile(
  path.join(releaseRoot, "examples", "valid", "order-processing.json"),
  `${JSON.stringify(validPackage, null, 2)}\n`,
);

const invalidPackage = structuredClone(validPackage);
delete invalidPackage.title;
await writeFile(
  path.join(releaseRoot, "examples", "invalid", "missing-title.json"),
  `${JSON.stringify(invalidPackage, null, 2)}\n`,
);

const invalidEvidenceReport = JSON.parse(
  await readFile(
    path.join(
      releaseRoot,
      "examples",
      "evidence",
      "valid-evidence-report.json",
    ),
    "utf8",
  ),
);
invalidEvidenceReport.uncertainty.conflicts[0].packageRepresentations = [];
await writeFile(
  path.join(
    releaseRoot,
    "examples",
    "evidence",
    "invalid-unrepresented-conflict.json",
  ),
  `${JSON.stringify(invalidEvidenceReport, null, 2)}\n`,
);

const schema = JSON.parse(
  await readFile(
    path.join(releaseRoot, "contracts", "curriculum.schema.json"),
    "utf8",
  ),
);
const ajv = new Ajv2020({
  allErrors: true,
  code: { esm: true, source: true },
  strict: false,
});
const standaloneSource = standaloneCode(ajv, ajv.compile(schema));
const temporaryEntry = path.join(
  frontendRoot,
  ".angular",
  "authoring-kit-validator.entry.mjs",
);
await mkdir(path.dirname(temporaryEntry), { recursive: true });
await writeFile(temporaryEntry, standaloneSource);
await esbuild.build({
  absWorkingDir: frontendRoot,
  bundle: true,
  entryPoints: [temporaryEntry],
  format: "esm",
  legalComments: "none",
  minify: true,
  outfile: path.join(releaseRoot, "scripts", "curriculum.validator.mjs"),
  platform: "node",
  target: "node22",
});
await rm(temporaryEntry);

const artifactDefinitions = [
  ["Quick start", "README.md", "text/markdown"],
  ["Agent instructions", "AGENTS.md", "text/markdown"],
  ["Generation prompt", "prompts/generate-curriculum.md", "text/markdown"],
  ["Authoring skill", "skills/repofluent-authoring/SKILL.md", "text/markdown"],
  [
    "Citation and uncertainty guide",
    "guides/citations-and-uncertainty.md",
    "text/markdown",
  ],
  ["Stable generation guide", "guides/stable-generation.md", "text/markdown"],
  ["Local validation guide", "guides/local-validation.md", "text/markdown"],
  ["C# analysis guide", "guides/dotnet-analysis.md", "text/markdown"],
  ["Angular analysis guide", "guides/angular-analysis.md", "text/markdown"],
  [
    "Curriculum JSON Schema",
    "contracts/curriculum.schema.json",
    "application/schema+json",
  ],
  [
    "Curriculum interface control document",
    "contracts/ICD.md",
    "text/markdown",
  ],
  [
    "Representative valid package",
    "examples/valid/order-processing.json",
    "application/json",
  ],
  [
    "Missing-title invalid package",
    "examples/invalid/missing-title.json",
    "application/json",
  ],
  [
    "Unsupported-extension warning package",
    "examples/warnings/unsupported-extension.json",
    "application/json",
  ],
  [
    "Approved source-scope declaration",
    "examples/scope/approved-scope.json",
    "application/json",
  ],
  [
    "Secret-exposure source-scope declaration",
    "examples/scope/secret-exposure-scope.json",
    "application/json",
  ],
  [
    "Valid evidence and uncertainty report",
    "examples/evidence/valid-evidence-report.json",
    "application/json",
  ],
  [
    "Unrepresented-conflict evidence report",
    "examples/evidence/invalid-unrepresented-conflict.json",
    "application/json",
  ],
  [
    "First deterministic identity run",
    "examples/identities/regeneration-a.json",
    "application/json",
  ],
  [
    "Reworded deterministic identity run",
    "examples/identities/regeneration-b.json",
    "application/json",
  ],
  [
    "Colliding identity run",
    "examples/identities/collision.json",
    "application/json",
  ],
  [
    "Completed generation run",
    "examples/generation/completed-run.json",
    "application/json",
  ],
  [
    "C# ecosystem analysis report",
    "examples/analysis/dotnet-analysis.json",
    "application/json",
  ],
  [
    "Angular ecosystem analysis report",
    "examples/analysis/angular-analysis.json",
    "application/json",
  ],
  [
    "Approved repository instructions",
    "examples/fixtures/repositories/order-platform/AGENTS.md",
    "text/markdown",
  ],
  [
    "Approved architecture document",
    "examples/fixtures/repositories/order-platform/docs/architecture.md",
    "text/markdown",
  ],
  [
    "Conflicting operations document",
    "examples/fixtures/repositories/order-platform/docs/operations.md",
    "text/markdown",
  ],
  [
    "Approved application source",
    "examples/fixtures/repositories/order-platform/src/app.ts",
    "text/typescript",
  ],
  [
    "Directory-scoped repository instructions",
    "examples/fixtures/repositories/order-platform/src/payments/AGENTS.md",
    "text/markdown",
  ],
  [
    "Approved payment source",
    "examples/fixtures/repositories/order-platform/src/payments/handler.ts",
    "text/typescript",
  ],
  [
    "Explicitly excluded payment source",
    "examples/fixtures/repositories/order-platform/src/payments/private/ledger.txt",
    "text/plain",
  ],
  [
    "Secret-exposure repository instructions",
    "examples/fixtures/repositories/secret-exposure/AGENTS.md",
    "text/markdown",
  ],
  [
    "Secret-exposure architecture document",
    "examples/fixtures/repositories/secret-exposure/docs/architecture.md",
    "text/markdown",
  ],
  [
    "Suspected-secret fixture",
    "examples/fixtures/repositories/secret-exposure/src/config/application.env",
    "text/plain",
  ],
  [
    "C# solution fixture",
    "examples/fixtures/repositories/dotnet-order-platform/OrderPlatform.sln",
    "text/plain",
  ],
  [
    "C# project fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Api/Orders.Api.csproj",
    "text/xml",
  ],
  [
    "C# composition fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Api/Program.cs",
    "text/x-csharp",
  ],
  [
    "C# dynamic registration fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Api/DynamicRegistration.cs",
    "text/x-csharp",
  ],
  [
    "C# controller fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Api/Controllers/OrdersController.cs",
    "text/x-csharp",
  ],
  [
    "C# domain service fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Domain/OrderService.cs",
    "text/x-csharp",
  ],
  [
    "C# repository fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Infrastructure/OrderRepository.cs",
    "text/x-csharp",
  ],
  [
    "C# publisher fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Infrastructure/OrderPublisher.cs",
    "text/x-csharp",
  ],
  [
    "C# external client fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Infrastructure/InventoryClient.cs",
    "text/x-csharp",
  ],
  [
    "C# worker fixture",
    "examples/fixtures/repositories/dotnet-order-platform/src/Orders.Worker/OrderWorker.cs",
    "text/x-csharp",
  ],
  [
    "C# test fixture",
    "examples/fixtures/repositories/dotnet-order-platform/tests/Orders.Api.Tests/OrdersControllerTests.cs",
    "text/x-csharp",
  ],
  [
    "Angular package fixture",
    "examples/fixtures/repositories/angular-storefront/package.json",
    "application/json",
  ],
  [
    "Angular bootstrap fixture",
    "examples/fixtures/repositories/angular-storefront/src/main.ts",
    "text/typescript",
  ],
  [
    "Angular application configuration fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/app.config.ts",
    "text/typescript",
  ],
  [
    "Angular routes fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/app.routes.ts",
    "text/typescript",
  ],
  [
    "Angular guard fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/auth/signed-in.guard.ts",
    "text/typescript",
  ],
  [
    "Angular interceptor fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/auth/correlation.interceptor.ts",
    "text/typescript",
  ],
  [
    "Angular checkout component fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/checkout/checkout-page.component.ts",
    "text/typescript",
  ],
  [
    "Angular checkout template fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/checkout/checkout-page.component.html",
    "text/html",
  ],
  [
    "Angular checkout service fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/checkout/checkout.service.ts",
    "text/typescript",
  ],
  [
    "Angular checkout store fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/checkout/checkout.store.ts",
    "text/typescript",
  ],
  [
    "Angular checkout test fixture",
    "examples/fixtures/repositories/angular-storefront/src/app/checkout/checkout.store.spec.ts",
    "text/typescript",
  ],
  [
    "Angular environment fixture",
    "examples/fixtures/repositories/angular-storefront/src/environments/environment.ts",
    "text/typescript",
  ],
  ["Source-scope preflight", "scripts/preflight.mjs", "text/javascript"],
  [
    "Evidence and uncertainty validator",
    "scripts/validate-evidence.mjs",
    "text/javascript",
  ],
  [
    "Deterministic identity generator",
    "scripts/generate-identities.mjs",
    "text/javascript",
  ],
  [
    "Generation manifest finalizer",
    "scripts/finalize-generation.mjs",
    "text/javascript",
  ],
  [
    "Ecosystem analysis verifier",
    "scripts/verify-ecosystem-analysis.mjs",
    "text/javascript",
  ],
  ["Local validation command", "scripts/validate.mjs", "text/javascript"],
  [
    "Compiled offline validator",
    "scripts/curriculum.validator.mjs",
    "text/javascript",
  ],
  [
    "Release verification command",
    "scripts/verify-release.mjs",
    "text/javascript",
  ],
  ["Release notes", "release-notes.md", "text/markdown"],
];

const artifacts = [];
for (const [name, artifactPath, mediaType] of artifactDefinitions) {
  artifacts.push({
    name,
    path: artifactPath,
    mediaType,
    sha256: await hashFile(path.join(releaseRoot, artifactPath)),
  });
}

const checksumText = artifacts
  .toSorted((left, right) => left.path.localeCompare(right.path))
  .map((artifact) => `${artifact.sha256}  ${artifact.path}\n`)
  .join("");
await writeFile(path.join(releaseRoot, "checksums.sha256"), checksumText);
artifacts.push({
  name: "Artifact checksums",
  path: "checksums.sha256",
  mediaType: "text/plain",
  sha256: await hashFile(path.join(releaseRoot, "checksums.sha256")),
});

const checksumInput = artifacts
  .toSorted((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  )
  .map((artifact) => `${artifact.path}:${artifact.sha256}\n`)
  .join("");
const releaseChecksum = createHash("sha256")
  .update(checksumInput)
  .digest("hex");
const manifest = {
  kit: "repofluent-authoring-kit",
  kitVersion: "0.1.0",
  contractVersion: "0.1.0",
  validatorVersion: "0.1.0",
  status: "prerelease",
  publishedAt: "2026-07-23T12:00:00Z",
  runtime: {
    name: "Node.js",
    version: ">=22.0.0",
  },
  checksumAlgorithm: "sha256",
  releaseChecksum: `sha256:${releaseChecksum}`,
  checksumInput:
    "Artifact path and SHA-256 pairs sorted by ordinal path and terminated by LF.",
  offline: {
    supported: true,
    validationRequiresNetwork: false,
    optionalNetworkFeaturesEnabledByDefault: false,
    optionalNetworkFeatures: ["approved source-provider acquisition"],
  },
  artifacts,
};
await writeFile(
  path.join(releaseRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `Authoring kit ${manifest.kitVersion} built with ${artifacts.length} artifacts.`,
);

async function hashFile(filePath) {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}
