import { test } from '@playwright/test';
import path from 'node:path';
import { AccessibleInteractionPage } from './pages/accessible-interaction.page';

// Traces to: L2-EXP-08, L2-EXP-09, L2-EXP-10.
test.describe('enforce accessible interaction', () => {
  test('pages expose meaningful structure, names, and WCAG 2.2 AA semantics', async ({ page }) => {
    const accessibility = new AccessibleInteractionPage(page);

    await accessibility.open();
    await accessibility.expectSemanticStructure();
  });

  test('modal and route interactions contain, restore, and place focus', async ({ page }) => {
    const accessibility = new AccessibleInteractionPage(page);

    await accessibility.open();
    await accessibility.openCommandSearch();
    await accessibility.expectScreenshot('enforce-accessible-command-dialog.png');
    await accessibility.expectModalFocusContainment();
    await accessibility.closeCommandSearchWithEscape();
    await accessibility.expectRouteHeadingFocus();
  });

  test('validation errors and async states remain visible and announced', async ({ page }) => {
    const accessibility = new AccessibleInteractionPage(page);
    const curriculumPackage = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );

    await accessibility.open();
    await accessibility.expectDescribedPackageError();
    await accessibility.useNarrowViewport();
    await accessibility.expectScreenshot('enforce-accessible-validation-error-narrow.png');
    await accessibility.expectValidationAnnouncements(curriculumPackage);
  });
});
