import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { AuthoringKitPage } from './pages/authoring-kit.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-01, L2-AAK-12.
test('a complete checksummed authoring kit is discoverable and offline ready', async ({ page }) => {
  const appShell = new AppShellPage(page);
  const authoringKit = new AuthoringKitPage(page);

  await appShell.open();
  await appShell.actAs('author');
  await authoringKit.open();
  await authoringKit.expectPortableOfflineRelease();
  await authoringKit.expectVisualContract();
});

test('the acquired kit validates examples without a network dependency', async ({ page }) => {
  const authoringKit = new AuthoringKitPage(page);
  await authoringKit.open();

  const manifest = await authoringKit.getManifest();
  expect(manifest).toMatchObject({
    kit: 'repofluent-authoring-kit',
    kitVersion: '0.1.0',
    contractVersion: '0.1.0',
    validatorVersion: '0.1.0',
    offline: {
      supported: true,
      validationRequiresNetwork: false,
      optionalNetworkFeaturesEnabledByDefault: false,
    },
  });
  expect(manifest.releaseChecksum).toMatch(/^sha256:[a-f0-9]{64}$/);

  const validatorPath = path.join(releaseRoot, 'scripts', 'validate.mjs');
  const validPath = path.join(releaseRoot, 'examples', 'valid', 'order-processing.json');
  const invalidPath = path.join(releaseRoot, 'examples', 'invalid', 'missing-title.json');
  const environment = { ...process.env, REPOFLUENT_OFFLINE: 'true' };

  const valid = await execFileAsync(process.execPath, [validatorPath, validPath], {
    env: environment,
  });
  expect(JSON.parse(valid.stdout)).toEqual({ valid: true, issues: [] });

  await expect(
    execFileAsync(process.execPath, [validatorPath, invalidPath], {
      env: environment,
    }),
  ).rejects.toMatchObject({
    code: 1,
    stdout: expect.stringContaining('"path":"/title"'),
  });
});
