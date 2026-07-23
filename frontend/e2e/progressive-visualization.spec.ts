import { test } from '@playwright/test';
import { ProgressiveVisualizationPage } from './pages/progressive-visualization.page';

// Traces to: L2-EXP-04, L2-EXP-05, L2-EXP-11.
test('system visualization remains equivalent when GPU enhancement is unavailable', async ({
  page,
}) => {
  const visualization = new ProgressiveVisualizationPage(page);

  await visualization.openWithGpuPolicy('off');
  await visualization.expectSafeFallback('policy-disabled');
  await visualization.expectEquivalentCompanion();
  await visualization.selectMessageBusFromCompanion();
  await visualization.expectScreenshot('provide-progressive-visualization-fallback.png');

  await visualization.filterToPlatformLayer();
  await visualization.useNarrowViewport();
  await visualization.expectNoPageOverflow();
  await visualization.expectScreenshot('provide-progressive-visualization-narrow.png');

  await visualization.openWithGpuPolicy('fail');
  await visualization.expectSafeFallback('initialization-failed');
  await visualization.expectEquivalentCompanion();
});
