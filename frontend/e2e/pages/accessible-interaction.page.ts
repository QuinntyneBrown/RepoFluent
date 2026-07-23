import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export class AccessibleInteractionPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();
  }

  async expectSemanticStructure(): Promise<void> {
    await expect(this.page.getByRole('banner')).toBeVisible();
    await expect(this.page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(this.page.getByRole('main')).toBeVisible();
    await expect(this.page.getByRole('contentinfo', { name: 'Application status' })).toBeVisible();

    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const seriousViolations = results.violations
      .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      .map((violation) => ({
        help: violation.help,
        id: violation.id,
        targets: violation.nodes.flatMap((node) => node.target),
      }));

    expect(seriousViolations).toEqual([]);
  }

  async openCommandSearch(): Promise<void> {
    const trigger = this.page.getByRole('button', {
      name: 'Search curriculum, code, and systems',
    });
    await trigger.focus();
    await trigger.click();

    await expect(this.page.getByRole('dialog', { name: 'Command search' })).toBeVisible();
    await expect(this.page.getByRole('searchbox', { name: 'Search commands' })).toBeFocused();
  }

  async expectModalFocusContainment(): Promise<void> {
    const search = this.page.getByRole('searchbox', { name: 'Search commands' });
    const close = this.page.getByRole('button', { name: 'Close command search' });

    await this.page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await this.page.keyboard.press('Tab');
    await expect(search).toBeFocused();
  }

  async closeCommandSearchWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByRole('dialog', { name: 'Command search' })).toBeHidden();
    await expect(
      this.page.getByRole('button', { name: 'Search curriculum, code, and systems' }),
    ).toBeFocused();
  }

  async expectRouteHeadingFocus(): Promise<void> {
    await this.page.getByRole('link', { name: 'My learning' }).click();
    await expect(this.page.getByRole('heading', { name: 'My learning' })).toBeFocused();
    await expect(this.page.getByRole('status', { name: 'Page navigation' })).toHaveText(
      'My learning page loaded',
    );
  }

  async expectDescribedPackageError(): Promise<void> {
    const input = this.page.getByLabel('Curriculum package');
    const submit = this.page.getByRole('button', { name: 'Upload and validate' });
    await submit.click();

    await expect(submit).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', /curriculum-package-error/);
    await expect(this.page.locator('#curriculum-package-error')).toContainText(
      'Choose a curriculum package first.',
    );
    await input.scrollIntoViewIfNeeded();
  }

  async expectValidationAnnouncements(packagePath: string): Promise<void> {
    await this.page.route(
      '**/api/curriculum-imports',
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        await route.continue();
      },
      { times: 1 },
    );

    const input = this.page.getByLabel('Curriculum package');
    const submit = this.page.getByRole('button', { name: 'Upload and validate' });
    const status = this.page.getByRole('status', { name: 'Curriculum operation status' });

    await input.setInputFiles(packagePath);
    await submit.click();

    await expect(submit).toBeFocused();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(status).toHaveText('Uploading curriculum package');

    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();
    await expect(status).toHaveText('Curriculum package is ready for review');
    await expect(submit).toBeFocused();
    await expect(submit).toHaveAttribute('aria-busy', 'false');
  }

  async useNarrowViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 390, height: 844 });
    await this.page.getByLabel('Curriculum package').scrollIntoViewIfNeeded();
  }

  async expectScreenshot(name: string): Promise<void> {
    await expect(this.page).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio: 0.015,
    });
  }
}
