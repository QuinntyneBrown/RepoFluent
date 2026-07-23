import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { ContractExtensionsPage } from './pages/contract-extensions.page';

const packagePath = path.resolve(
  process.cwd(),
  '..',
  'contracts/curriculum/0.1.0/fixtures/order-processing.json',
);

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-CIC-13.
test('unsupported noncritical extensions warn without changing core interpretation', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const extensions = new ContractExtensionsPage(page);
  const packageBody = await buildPackageWithExtension(false, 'extension-noncritical-foundations');

  await appShell.open();
  await appShell.actAs('author');
  await extensions.uploadNoncriticalAndInspect(JSON.stringify(packageBody));
  await extensions.expectCoreAndExtensionPolicy();
  await extensions.expectVisualContract();
});

test('unsupported critical extensions and core-field redefinitions block exact paths', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const extensions = new ContractExtensionsPage(page);

  await appShell.open();
  await appShell.actAs('author');

  const critical = await buildPackageWithExtension(true, 'extension-critical-rejection');
  await extensions.uploadAndExpectBlockingIssue(
    JSON.stringify(critical),
    'CIC_UNSUPPORTED_CRITICAL_EXTENSION',
    '/extensions/0/namespace',
  );

  const redefinition = await buildPackageWithExtension(false, 'extension-core-redefinition');
  redefinition.extensions[0].data.title = 'Replacement core title';
  await extensions.uploadAndExpectBlockingIssue(
    JSON.stringify(redefinition),
    'CIC_EXTENSION_REDEFINES_CORE',
    '/extensions/0/data/title',
  );
});

async function buildPackageWithExtension(critical: boolean, packageId: string) {
  const packageBody = JSON.parse(await readFile(packagePath, 'utf8'));
  packageBody.packageId = packageId;
  packageBody.extensions = [
    {
      namespace: 'com.acme.learning.insights',
      version: '1.2.0',
      critical,
      data: {
        dashboardLabel: 'Order flow insight',
        cohortGrouping: 'platform-engineering',
      },
    },
  ];
  return packageBody;
}
