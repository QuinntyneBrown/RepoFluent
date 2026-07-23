import { test } from '@playwright/test';
import path from 'node:path';
import { PerformanceBudgetPage } from './pages/performance-budget.page';
import { ResponsiveNavigationPage } from './pages/responsive-navigation.page';

// Traces to: L2-EXP-12, L2-EXP-13.
test('approved profile gates shell and representative interaction performance', async ({
  page,
  request,
}) => {
  const performanceBudget = new PerformanceBudgetPage(page);
  const responsiveNavigation = new ResponsiveNavigationPage(page);
  const curriculumPackage = path.resolve(
    process.cwd(),
    '..',
    'contracts/curriculum/0.1.0/fixtures/order-processing.json',
  );
  const lessonUrl = await responsiveNavigation.createLargeAssignedLesson(
    request,
    curriculumPackage,
  );

  await performanceBudget.open();
  await performanceBudget.expectApprovedProfile();
  await performanceBudget.expectShellBudget();
  await performanceBudget.expectScreenshot('meet-performance-budgets-desktop.png');

  await performanceBudget.useNarrowViewport();
  await performanceBudget.expectNoPageOverflow();
  await performanceBudget.expectScreenshot('meet-performance-budgets-narrow.png');

  await page.setViewportSize({ width: 1280, height: 720 });
  await performanceBudget.exerciseRepresentativeInteractions(lessonUrl);
  await performanceBudget.expectInteractionBudget();
  await performanceBudget.expectPrivacySafeRumContract();
  await performanceBudget.expectReducedMotionPolicy();
});
