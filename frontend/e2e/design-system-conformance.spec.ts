import { expect, test } from '@playwright/test';
import { DesignSystemPage } from './pages/design-system.page';

// Traces to: L2-EXP-01, L2-EXP-02, L2-EXP-03.
test.describe('govern the design system', () => {
  test('the Angular consumer uses the versioned default and tenant token contracts', async ({
    page,
  }) => {
    const designSystem = new DesignSystemPage(page);

    await designSystem.open();
    const defaultPrimary = await designSystem.expectTheme('default');
    await designSystem.expectScreenshot('govern-design-system-default.png');

    await designSystem.open('tenant');
    const tenantPrimary = await designSystem.expectTheme('tenant');
    expect(tenantPrimary).not.toBe(defaultPrimary);
    await designSystem.expectScreenshot('govern-design-system-tenant.png');

    await designSystem.useNarrowViewport();
    await designSystem.open();
    await designSystem.expectTheme('default');
    await designSystem.expectScreenshot('govern-design-system-narrow.png', 0.05);
  });

  test('interactive states remain visible and operable at high zoom', async ({ page }) => {
    const designSystem = new DesignSystemPage(page);

    await designSystem.open();
    await designSystem.expectKeyboardStateAtHighZoom();
  });

  test('reduced motion preserves immediate operable state changes', async ({ page }) => {
    const designSystem = new DesignSystemPage(page);

    await designSystem.expectReducedMotion();
  });
});
