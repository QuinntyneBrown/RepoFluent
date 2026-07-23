import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AuthoringScopePage } from './pages/authoring-scope.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');
const preflightPath = path.join(releaseRoot, 'scripts', 'preflight.mjs');

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-02, L2-AAK-03, L2-AAK-04.
test('directory guidance and explicit exclusions bound the effective source scope', async ({
  page,
}) => {
  const scopePage = new AuthoringScopePage(page);
  await scopePage.open();
  await scopePage.expectGovernedBoundary();

  const scopePath = path.join(releaseRoot, 'examples', 'scope', 'approved-scope.json');
  const result = await execFileAsync(process.execPath, [preflightPath, scopePath], {
    env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
  });
  const report = JSON.parse(result.stdout);

  expect(report.valid).toBe(true);
  expect(report.scopeId).toBe('approved-order-platform');
  expect(report.repositories[0].guidanceOrder).toEqual(['AGENTS.md', 'src/payments/AGENTS.md']);
  expect(report.repositories[0].effectiveFiles).toContain('src/payments/handler.ts');
  expect(report.repositories[0].effectiveFiles).not.toContain('src/payments/private/ledger.txt');
  expect(report.repositories[0].exclusions).toContainEqual({
    path: 'src/payments/private/ledger.txt',
    guidance: 'src/payments/AGENTS.md',
    reason: 'Directory guidance exclusion',
  });

  await scopePage.expectVisualContract();
});

test('suspected credentials stop preflight without reproducing the value', async () => {
  const scopePath = path.join(releaseRoot, 'examples', 'scope', 'secret-exposure-scope.json');
  const seededCredential = 'AKIAREPOFLUENTDEMO12';

  await expect(
    execFileAsync(process.execPath, [preflightPath, scopePath], {
      env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
    }),
  ).rejects.toMatchObject({
    code: 1,
    stdout: expect.stringContaining('"code":"AAK_SECRET_SUSPECTED"'),
  });

  try {
    await execFileAsync(process.execPath, [preflightPath, scopePath]);
  } catch (error) {
    expect((error as { stdout: string }).stdout).not.toContain(seededCredential);
    expect(JSON.parse((error as { stdout: string }).stdout).findings[0]).toMatchObject({
      code: 'AAK_SECRET_SUSPECTED',
      severity: 'error',
      isBlocking: true,
      path: 'src/config/application.env',
    });
  }
});
