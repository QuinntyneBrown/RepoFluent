import { test } from '@playwright/test';
import { CurriculumVersionGovernancePage } from './pages/curriculum-version-governance.page';

// Traces to: L2-CLI-10, L2-CLI-11.
test.setTimeout(180_000);

test('reviewer compares semantic impact before an administrator retires a retained version', async ({
  page,
  request,
}) => {
  const versions = new CurriculumVersionGovernancePage(page);

  await versions.createPublishedVersions(request);
  await versions.openComparisonAsReviewer();
  await versions.retireVersionAsAdministrator(request);
  await versions.expectVisualContract();
});
