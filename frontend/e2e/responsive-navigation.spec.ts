import { test } from '@playwright/test';
import path from 'node:path';
import { ResponsiveNavigationPage } from './pages/responsive-navigation.page';

// Traces to: L2-EXP-06, L2-EXP-07, L2-EXP-14.
test('responsive navigation preserves source context and progressive lesson position', async ({
  page,
  request,
}) => {
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

  await responsiveNavigation.openAssignedLesson(lessonUrl);
  await responsiveNavigation.expectProgressiveContent(33);

  await responsiveNavigation.openSourceContext();
  await responsiveNavigation.expectDesktopSplitLayout();
  await responsiveNavigation.expectScreenshot('preserve-responsive-navigation-desktop.png', 0.08);
  await responsiveNavigation.closeSourceWithBrowserBack();

  await responsiveNavigation.useNarrowViewport();
  await responsiveNavigation.expectNoPageOverflow();
  await responsiveNavigation.openSourceContext();
  await responsiveNavigation.expectNarrowDrawerLayout();
  await responsiveNavigation.expectScreenshot('preserve-responsive-navigation-narrow.png', 0.08);
  await responsiveNavigation.closeSourceWithControl();

  await responsiveNavigation.useHighZoomEquivalentViewport();
  await responsiveNavigation.expectNoPageOverflow();
  await responsiveNavigation.revealAllContent(33);
});
