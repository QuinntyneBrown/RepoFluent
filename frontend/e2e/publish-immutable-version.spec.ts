import { test } from '@playwright/test';
import { CurriculumPublicationPage } from './pages/curriculum-publication.page';

// Traces to: L2-CLI-08, L2-CLI-09.
test('administrator publishes one active immutable version with durable evidence', async ({
  page,
}) => {
  const publication = new CurriculumPublicationPage(page);

  await publication.openApprovedDraft();
  await publication.publishAsAdministrator();
  await publication.expectVisualContract();
});
