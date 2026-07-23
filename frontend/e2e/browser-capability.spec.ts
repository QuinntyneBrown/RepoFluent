import { test } from '@playwright/test';
import { BrowserCapabilityPage } from './pages/browser-capability.page';

// Traces to: L2-EXP-15.
test('supported browser profiles pass a critical flow and no-GPU fallback', async ({
  browser,
  browserName,
  page,
}) => {
  const browserCapability = new BrowserCapabilityPage(page);

  await browserCapability.open();
  await browserCapability.expectPublishedPolicy(browserName, browser.version());
  await browserCapability.expectSupportedCriticalFlow();
  await browserCapability.expectSupportedOutcome();

  if (browserName === 'chromium') {
    await page.goto('/quality');
    await browserCapability.showPolicyEvidence();
    await browserCapability.expectScreenshot('govern-browser-capabilities-supported.png');
  }
});

test('unsupported browser profile receives non-disclosing guidance and safe access', async ({
  browserName,
  page,
}) => {
  const browserCapability = new BrowserCapabilityPage(page);

  await browserCapability.openUnsupported();
  await browserCapability.expectUnsupportedGuidanceAndSafeAccess();
  await browserCapability.expectUnsupportedOutcome();

  if (browserName === 'chromium') {
    await page.goto('/quality?browser=unsupported');
    await browserCapability.useNarrowViewport();
    await browserCapability.expectScreenshot('govern-browser-capabilities-unsupported-narrow.png');
  }
});
