import { test } from '@playwright/test';
import { CurriculumLifecycleOperationsPage } from './pages/curriculum-lifecycle-operations.page';

// Traces to: L2-CLI-13, L2-CLI-14.
test.setTimeout(120_000);

test('auditor sees ordered lifecycle operations without mutable gaps', async ({
  page,
  request,
}) => {
  const lifecycle = new CurriculumLifecycleOperationsPage(page);

  await lifecycle.createAuditedRetirement(request);
  await lifecycle.openHistoryAsAuditor();
  await lifecycle.expectVisualContract();
});
