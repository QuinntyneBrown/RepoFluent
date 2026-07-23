import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractRoot = path.join(repositoryRoot, 'contracts', 'curriculum');
const errors = [];
const requiredArtifacts = new Set([
  'curriculum.schema.json',
  'ICD.md',
  'compatibility.json',
  'validation-codes.json',
  'fixtures/minimal-valid.json',
  'fixtures/order-processing.json',
  'fixtures/conformance-catalog.json',
  'release-notes.md',
]);
const requiredFailureCategories = new Set([
  'required-fields',
  'types',
  'identifiers',
  'references',
  'ordering',
  'security',
  'assessment-rules',
  'limits',
]);

const releaseDirectories = (await readdir(contractRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const version of releaseDirectories) {
  await verifyRelease(version);
}

if (errors.length > 0) {
  console.error(`Contract release verification errors: ${errors.length}`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`Contract releases verified: ${releaseDirectories.length}`);

async function verifyRelease(version) {
  const releaseRoot = path.join(contractRoot, version);
  const manifest = await readJson(path.join(releaseRoot, 'release-manifest.json'));
  if (!manifest) return;

  if (manifest.version !== version) {
    errors.push(`${version}: manifest version is ${manifest.version ?? 'absent'}`);
  }
  if (manifest.checksumAlgorithm !== 'sha256') {
    errors.push(`${version}: checksum algorithm is not sha256`);
  }

  const artifactPaths = new Set(manifest.artifacts?.map((artifact) => artifact.path) ?? []);
  for (const required of requiredArtifacts) {
    if (!artifactPaths.has(required)) errors.push(`${version}: missing artifact ${required}`);
  }

  const checksumLines = [];
  for (const artifact of manifest.artifacts ?? []) {
    if (
      typeof artifact.path !== 'string' ||
      path.isAbsolute(artifact.path) ||
      artifact.path.split(/[\\/]/).includes('..')
    ) {
      errors.push(`${version}: unsafe artifact path ${artifact.path ?? 'absent'}`);
      continue;
    }

    const artifactPath = path.join(releaseRoot, artifact.path);
    let bytes;
    try {
      bytes = await readFile(artifactPath);
    } catch {
      errors.push(`${version}: artifact is not retrievable at ${artifact.path}`);
      continue;
    }

    const actual = createHash('sha256').update(bytes).digest('hex');
    if (artifact.sha256 !== actual) {
      errors.push(`${version}: checksum mismatch for ${artifact.path}`);
    }
    checksumLines.push([artifact.path, actual]);
    await verifyArtifactVersion(version, artifact.path, bytes);
  }

  const checksumInput = checksumLines
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([artifactPath, checksum]) => `${artifactPath}:${checksum}\n`)
    .join('');
  const releaseChecksum = createHash('sha256').update(checksumInput).digest('hex');
  if (manifest.releaseChecksum !== `sha256:${releaseChecksum}`) {
    errors.push(`${version}: release checksum mismatch`);
  }

  await verifyFixtures(version, releaseRoot, manifest);
  await verifyValidationCodes(version, releaseRoot);
}

async function verifyArtifactVersion(version, artifactPath, bytes) {
  const content = bytes.toString('utf8');
  if (artifactPath.endsWith('.json')) {
    let value;
    try {
      value = JSON.parse(content);
    } catch {
      errors.push(`${version}: ${artifactPath} is not valid JSON`);
      return;
    }

    const identifiesVersion =
      value.contractVersion === version ||
      value.version === version ||
      value.$id?.includes(`/${version}/`) ||
      value.title?.includes(version);
    if (!identifiesVersion) {
      errors.push(`${version}: ${artifactPath} does not identify its contract version`);
    }
    return;
  }

  if (!content.includes(version)) {
    errors.push(`${version}: ${artifactPath} does not identify its contract version`);
  }
}

async function verifyFixtures(version, releaseRoot, manifest) {
  const catalog = await readJson(
    path.join(releaseRoot, 'fixtures', 'conformance-catalog.json'),
  );
  if (!catalog) return;

  const cases = catalog.cases ?? [];
  const successful = cases.filter((item) => item.expected?.outcome === 'success');
  const expectedFailures = cases.filter((item) => item.expected?.outcome === 'failure');
  const categories = new Set(expectedFailures.map((item) => item.category));

  if (cases.length !== manifest.fixtureSummary?.total) {
    errors.push(`${version}: fixture total does not match the manifest`);
  }
  if (successful.length !== manifest.fixtureSummary?.successful) {
    errors.push(`${version}: successful fixture total does not match the manifest`);
  }
  if (expectedFailures.length !== manifest.fixtureSummary?.expectedFailures) {
    errors.push(`${version}: invalid fixture total does not match the manifest`);
  }
  for (const category of requiredFailureCategories) {
    if (!categories.has(category)) {
      errors.push(`${version}: conformance category ${category} is absent`);
    }
  }
  for (const item of cases) {
    if (!item.expected?.outcome || !Array.isArray(item.expected?.issueCodes)) {
      errors.push(`${version}: fixture ${item.id ?? 'unknown'} has no declared outcome`);
    }
    const fixturePath = item.fixture ?? item.baseFixture;
    if (!fixturePath) {
      errors.push(`${version}: fixture ${item.id ?? 'unknown'} has no source package`);
      continue;
    }
    try {
      await readFile(path.join(releaseRoot, 'fixtures', fixturePath));
    } catch {
      errors.push(`${version}: fixture source ${fixturePath} is not retrievable`);
    }
  }
}

async function verifyValidationCodes(version, releaseRoot) {
  const catalog = await readJson(path.join(releaseRoot, 'validation-codes.json'));
  if (!catalog) return;

  const sourceFiles = [
    path.join(
      repositoryRoot,
      'backend',
      'src',
      'RepoFluent.Application',
      'PackageValidator.cs',
    ),
    path.join(
      repositoryRoot,
      'backend',
      'src',
      'RepoFluent.Api',
      'ContractReleaseCatalog.cs',
    ),
  ];
  const source = (
    await Promise.all(sourceFiles.map((sourceFile) => readFile(sourceFile, 'utf8')))
  ).join('\n');
  const sourceCodes = new Set(source.match(/CIC_[A-Z0-9_]+/g) ?? []);
  const catalogCodes = new Set((catalog.codes ?? []).map((item) => item.code));
  for (const code of sourceCodes) {
    if (!catalogCodes.has(code)) errors.push(`${version}: validation code ${code} is absent`);
  }
  for (const code of catalogCodes) {
    if (!sourceCodes.has(code)) errors.push(`${version}: validation code ${code} is stale`);
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${path.relative(repositoryRoot, filePath)}: ${error.message}`);
    return null;
  }
}
