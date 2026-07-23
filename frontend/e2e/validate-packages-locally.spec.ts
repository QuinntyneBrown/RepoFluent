import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AuthoringValidatorPage } from './pages/authoring-validator.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');
const validatorPath = path.join(releaseRoot, 'scripts', 'validate.mjs');
const environment = { ...process.env, REPOFLUENT_OFFLINE: 'true' };
const options = ['--contract', 'auto', '--format', 'json', '--threshold', 'warning'];

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-08.
test('valid warnings-only and blocking packages return deterministic local outcomes', async ({
  page,
}) => {
  const validatorPage = new AuthoringValidatorPage(page);
  await validatorPage.open();
  await validatorPage.expectNoninteractiveContract();

  const valid = await validate('valid/order-processing.json');
  expect(valid.status).toBe(0);
  expect(valid.report).toEqual({
    valid: true,
    outcome: 'success',
    contractVersion: '0.1.0',
    threshold: 'warning',
    issues: [],
  });

  const warning = await validate('warnings/unsupported-extension.json');
  expect(warning.status).toBe(3);
  expect(warning.report).toMatchObject({
    valid: true,
    outcome: 'warnings-only',
    contractVersion: '0.1.0',
    threshold: 'warning',
    issues: [
      {
        code: 'CIC_EXTENSION_IGNORED',
        severity: 'warning',
        isBlocking: false,
        path: '/extensions/0/namespace',
      },
    ],
  });

  const warningAtErrorThreshold = await runValidator([
    path.join(releaseRoot, 'examples', 'warnings', 'unsupported-extension.json'),
    '--contract',
    '0.1.0',
    '--format',
    'json',
    '--threshold',
    'error',
  ]);
  expect(warningAtErrorThreshold).toMatchObject({
    status: 0,
    report: { valid: true, outcome: 'success', threshold: 'error', issues: [] },
  });

  const warningText = await runValidatorText([
    path.join(releaseRoot, 'examples', 'warnings', 'unsupported-extension.json'),
    '--contract',
    'auto',
    '--format',
    'text',
    '--threshold',
    'warning',
  ]);
  expect(warningText.status).toBe(3);
  expect(warningText.stdout).toContain('warning CIC_EXTENSION_IGNORED /extensions/0/namespace');
  expect(warningText.stdout).not.toContain('Order Processing Foundations');

  const invalid = await validate('invalid/missing-title.json');
  expect(invalid.status).toBe(1);
  expect(invalid.report).toMatchObject({
    valid: false,
    outcome: 'validation-failure',
    issues: [{ code: 'CIC_REQUIRED', severity: 'error', path: '/title' }],
  });

  await validatorPage.expectVisualContract();
});

test('invocation and internal failures have distinct safe exit statuses', async () => {
  const invocation = await runValidator([
    path.join(releaseRoot, 'examples', 'valid', 'order-processing.json'),
    '--contract',
    '9.0.0',
  ]);
  expect(invocation.status).toBe(2);
  expect(invocation.report).toMatchObject({
    valid: false,
    outcome: 'invalid-invocation',
    issues: [{ code: 'AAK_VALIDATOR_INVOCATION', path: '/contract' }],
  });

  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'repofluent-validator-'));
  try {
    await copyFile(validatorPath, path.join(temporaryRoot, 'validate.mjs'));
    await writeFile(
      path.join(temporaryRoot, 'curriculum.validator.mjs'),
      'throw new Error("validator unavailable");\n',
    );
    const internal = await runValidator(
      [path.join(releaseRoot, 'examples', 'valid', 'order-processing.json')],
      path.join(temporaryRoot, 'validate.mjs'),
    );
    expect(internal.status).toBe(4);
    expect(internal.report).toMatchObject({
      valid: false,
      outcome: 'internal-failure',
      issues: [{ code: 'AAK_VALIDATOR_INTERNAL', path: '/' }],
    });
    expect(JSON.stringify(internal.report)).not.toContain('validator unavailable');
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

async function validate(fixturePath: string) {
  return runValidator([path.join(releaseRoot, 'examples', ...fixturePath.split('/')), ...options]);
}

async function runValidator(arguments_: string[], command = validatorPath) {
  try {
    const result = await execFileAsync(process.execPath, [command, ...arguments_], {
      env: environment,
    });
    return { status: 0, report: JSON.parse(result.stdout) };
  } catch (error) {
    const failure = error as { code: number; stdout: string };
    return { status: failure.code, report: JSON.parse(failure.stdout) };
  }
}

async function runValidatorText(arguments_: string[]) {
  try {
    const result = await execFileAsync(process.execPath, [validatorPath, ...arguments_], {
      env: environment,
    });
    return { status: 0, stdout: result.stdout };
  } catch (error) {
    const failure = error as { code: number; stdout: string };
    return { status: failure.code, stdout: failure.stdout };
  }
}
