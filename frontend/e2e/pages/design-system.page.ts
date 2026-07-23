import { expect, type Page } from '@playwright/test';

export class DesignSystemPage {
  constructor(private readonly page: Page) {}

  async open(theme: 'default' | 'tenant' = 'default'): Promise<void> {
    const query = theme === 'tenant' ? '?theme=tenant' : '';
    await this.page.goto(`/${query}`);
    await expect(this.page.getByRole('heading', { name: 'RepoFluent', exact: true })).toBeVisible();
  }

  async expectTheme(theme: 'default' | 'tenant'): Promise<string> {
    await expect(this.page.locator('html')).toHaveAttribute('data-rf-theme', theme);
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-rf-design-system-version',
      '0.1.0',
    );

    return this.page.locator('html').evaluate((root) => {
      return getComputedStyle(root).getPropertyValue('--rf-color-primary').trim();
    });
  }

  async expectKeyboardStateAtHighZoom(): Promise<void> {
    await this.page.setViewportSize({ width: 640, height: 900 });

    const action = this.page.getByRole('button', { name: 'Upload and validate' });
    await action.focus();
    await expect(action).toBeFocused();

    const focus = await action.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.outlineColor,
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });

    expect(focus.style).not.toBe('none');
    expect(focus.width).toBeGreaterThanOrEqual(2);
    expect(focus.color).not.toBe('rgba(0, 0, 0, 0)');

    const overflow = await this.page.locator('html').evaluate((root) => {
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  }

  async expectReducedMotion(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    await this.open();

    const durations = await this.page
      .getByRole('button', { name: 'Upload and validate' })
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          animation: style.animationDuration,
          transition: style.transitionDuration,
        };
      });

    expect(durations.animation).toBe('0.001s');
    expect(durations.transition.split(',').every((value) => value.trim() === '0.001s')).toBe(true);
  }

  async useNarrowViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 390, height: 844 });
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
