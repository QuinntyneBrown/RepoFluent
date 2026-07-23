import { test } from '@playwright/test';
import { CurriculumDraftReviewPage } from './pages/curriculum-draft-review.page';

// Traces to: L2-CLI-06, L2-CLI-07.
test('reviewer previews through production rendering and records an exact immutable decision', async ({
  page,
}) => {
  const draft = new CurriculumDraftReviewPage(page);

  await draft.openAndUploadAsAuthor();
  await draft.actAsReviewer();
  await draft.openLearnerEquivalentPreview();
  await draft.approveExactReport();
  await draft.expectVisualContract();
});
