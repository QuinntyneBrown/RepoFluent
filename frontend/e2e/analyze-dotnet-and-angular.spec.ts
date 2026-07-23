import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { AuthoringEcosystemPage } from './pages/authoring-ecosystem.page';

const execFileAsync = promisify(execFile);
const releaseRoot = path.resolve(process.cwd(), '..', 'authoring-kit', 'releases', '0.1.0');
const verifierPath = path.join(releaseRoot, 'scripts', 'verify-ecosystem-analysis.mjs');
const environment = { ...process.env, REPOFLUENT_OFFLINE: 'true' };

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-AAK-09, L2-AAK-10.
test('C# and Angular guidance produces source-resolved analysis without inferred behavior', async ({
  page,
}) => {
  const ecosystemPage = new AuthoringEcosystemPage(page);
  await ecosystemPage.open();
  await ecosystemPage.expectEvidenceCheckedProfiles();

  const dotnet = await verify('dotnet', 'dotnet-analysis.json');
  expect(dotnet).toMatchObject({
    valid: true,
    profile: 'dotnet',
    coverage: 11,
    unresolvedBehaviorCount: 1,
    flowSteps: 0,
  });
  expect(dotnet.citedPaths).toEqual(
    expect.arrayContaining([
      'OrderPlatform.sln',
      'src/Orders.Api/Program.cs',
      'src/Orders.Api/DynamicRegistration.cs',
      'src/Orders.Worker/OrderWorker.cs',
      'tests/Orders.Api.Tests/OrdersControllerTests.cs',
    ]),
  );

  const angular = await verify('angular', 'angular-analysis.json');
  expect(angular).toMatchObject({
    valid: true,
    profile: 'angular',
    coverage: 11,
    unresolvedBehaviorCount: 0,
    flowSteps: 5,
  });
  expect(angular.citedPaths).toEqual(
    expect.arrayContaining([
      'src/main.ts',
      'src/app/app.routes.ts',
      'src/app/checkout/checkout-page.component.ts',
      'src/app/checkout/checkout.service.ts',
      'src/app/checkout/checkout.store.ts',
    ]),
  );

  await ecosystemPage.expectVisualContract();
});

test('an Angular flow step without supplied source evidence is blocking', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'repofluent-analysis-'));
  try {
    const sourcePath = path.join(releaseRoot, 'examples', 'analysis', 'angular-analysis.json');
    const report = JSON.parse(await readFile(sourcePath, 'utf8'));
    report.flow[4].evidence.path = 'src/app/checkout/invented-runtime.ts';
    const reportPath = path.join(temporaryRoot, 'invented-runtime.json');
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    await expect(
      execFileAsync(process.execPath, [verifierPath, 'angular', reportPath], {
        env: environment,
      }),
    ).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining('"code":"AAK_ANALYSIS_SOURCE_MISSING"'),
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

async function verify(profile: string, fixture: string) {
  const reportPath = path.join(releaseRoot, 'examples', 'analysis', fixture);
  const result = await execFileAsync(process.execPath, [verifierPath, profile, reportPath], {
    env: environment,
  });
  return JSON.parse(result.stdout);
}
