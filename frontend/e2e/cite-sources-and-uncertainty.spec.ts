import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AuthoringEvidencePage } from './pages/authoring-evidence.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');
const validatorPath = path.join(releaseRoot, 'scripts', 'validate-evidence.mjs');
const scopePath = path.join(releaseRoot, 'examples', 'scope', 'approved-scope.json');

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-05, L2-AAK-06.
test('claims remain bound to snapshots while material conflicts stay visible', async ({ page }) => {
  const evidencePage = new AuthoringEvidencePage(page);
  await evidencePage.open();
  await evidencePage.expectGovernedEvidence();

  const reportPath = path.join(releaseRoot, 'examples', 'evidence', 'valid-evidence-report.json');
  const result = await execFileAsync(process.execPath, [validatorPath, reportPath, scopePath], {
    env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
  });
  const report = JSON.parse(result.stdout);

  expect(report.valid).toBe(true);
  expect(report.scopeId).toBe('approved-order-platform');
  expect(report.claims).toEqual({
    directEvidence: 2,
    synthesis: 1,
    interpretation: 0,
  });
  expect(report.uncertainty.conflicts).toBe(1);
  expect(report.uncertainty.materialRepresentations).toBe(1);
  expect(report.citedPaths).toEqual(
    expect.arrayContaining([
      'docs/architecture.md',
      'docs/operations.md',
      'src/payments/handler.ts',
    ]),
  );

  await evidencePage.expectVisualContract();
});

test('material uncertainty without package representation is blocking', async () => {
  const reportPath = path.join(
    releaseRoot,
    'examples',
    'evidence',
    'invalid-unrepresented-conflict.json',
  );

  await expect(
    execFileAsync(process.execPath, [validatorPath, reportPath, scopePath], {
      env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
    }),
  ).rejects.toMatchObject({
    code: 1,
    stdout: expect.stringContaining('"code":"AAK_UNCERTAINTY_UNREPRESENTED"'),
  });

  try {
    await execFileAsync(process.execPath, [validatorPath, reportPath, scopePath]);
  } catch (error) {
    expect(JSON.parse((error as { stdout: string }).stdout).findings[0]).toMatchObject({
      code: 'AAK_UNCERTAINTY_UNREPRESENTED',
      severity: 'error',
      isBlocking: true,
      path: '/uncertainty/conflicts/0/packageRepresentations',
    });
  }
});
