import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AuthoringGenerationPage } from './pages/authoring-generation.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');
const identityCommand = path.join(releaseRoot, 'scripts', 'generate-identities.mjs');
const manifestCommand = path.join(releaseRoot, 'scripts', 'finalize-generation.mjs');

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-07, L2-AAK-11.
test('prose changes preserve semantic identities and the visible generation policy', async ({
  page,
}) => {
  const generationPage = new AuthoringGenerationPage(page);
  await generationPage.open();
  await generationPage.expectStableGenerationPolicy();

  const first = await generateIdentities('regeneration-a.json');
  const second = await generateIdentities('regeneration-b.json');
  expect(first.valid).toBe(true);
  expect(second.valid).toBe(true);
  expect(first.entities).toHaveLength(7);
  expect(second.entities).toEqual(first.entities);
  expect(first.entities.map((entity: { kind: string }) => entity.kind)).toEqual([
    'package',
    'system',
    'course',
    'lesson',
    'objective',
    'code-reference',
    'assessment',
  ]);

  await generationPage.expectVisualContract();
});

test('semantic-key collisions block instead of overwriting an identity', async () => {
  const fixture = path.join(releaseRoot, 'examples', 'identities', 'collision.json');

  await expect(
    execFileAsync(process.execPath, [identityCommand, fixture], {
      env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
    }),
  ).rejects.toMatchObject({
    code: 1,
    stdout: expect.stringContaining('"code":"AAK_IDENTITY_COLLISION"'),
  });
});

test('generation manifest binds tool inputs time checksum and validation without private data', async () => {
  const runPath = path.join(releaseRoot, 'examples', 'generation', 'completed-run.json');
  const packagePath = path.join(releaseRoot, 'examples', 'valid', 'order-processing.json');
  const result = await execFileAsync(process.execPath, [manifestCommand, runPath, packagePath], {
    env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
  });
  const manifest = JSON.parse(result.stdout);

  expect(manifest).toMatchObject({
    manifestVersion: '0.1.0',
    kitVersion: '0.1.0',
    contractVersion: '0.1.0',
    tool: { id: 'repofluent-authoring-agent', version: '0.1.0' },
    model: { id: 'approved-model', version: '2026-07' },
    sourceSnapshot: { scopeId: 'approved-order-platform' },
    startedAt: '2026-07-23T16:00:00.000Z',
    completedAt: '2026-07-23T16:04:12.000Z',
    options: { language: 'en-CA', profile: 'dotnet-angular' },
    validation: { valid: true, issueCount: 0 },
  });
  expect(manifest.package.sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(result.stdout).not.toContain('chainOfThought');
  expect(result.stdout).not.toContain('credential');
  expect(result.stdout).not.toContain('fullPrompt');
});

async function generateIdentities(fixtureName: string) {
  const fixture = path.join(releaseRoot, 'examples', 'identities', fixtureName);
  const result = await execFileAsync(process.execPath, [identityCommand, fixture], {
    env: { ...process.env, REPOFLUENT_OFFLINE: 'true' },
  });
  return JSON.parse(result.stdout);
}
