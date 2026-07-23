import { test } from '@playwright/test';
import { ContractReleasePage } from './pages/contract-release.page';

// Traces to: L2-CIC-01, L2-CIC-12, L2-CIC-14.
test('a contract release is immutable, portable, and conformant', async ({ page, request }) => {
  const contractRelease = new ContractReleasePage(page);

  await contractRelease.open();
  await contractRelease.expectPublishedRelease();
  await contractRelease.expectCompatibilityAndMigrationPolicy();
  await contractRelease.expectConformanceCoverage();
  await contractRelease.expectPublicRetrieval(request);
  await contractRelease.expectVisualContract();
});
