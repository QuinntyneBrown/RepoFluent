import { expect, type Page } from '@playwright/test';

export class SafeContentAndCodePage {
  constructor(private readonly page: Page) {}

  async uploadAndPreview(packageJson: string): Promise<void> {
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'safe-content-and-code.json',
      mimeType: 'application/json',
      buffer: Buffer.from(packageJson),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await this.page.getByRole('button', { name: 'Inspect contract model' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'How an order becomes a workflow' }),
    ).toBeVisible();
  }

  async expectAllowListedVocabulary(): Promise<void> {
    const lesson = this.page.getByRole('region', { name: 'Rendered lesson' });
    await expect(lesson).toContainText(
      'A safe lesson connects structured explanation to revision-bound evidence.',
    );
    await expect(lesson.getByRole('complementary', { name: 'Architecture note' })).toContainText(
      'Publishing after persistence creates a durable handoff.',
    );

    const diagram = lesson.getByRole('figure', { name: 'Order submission flow' });
    await expect(diagram).toContainText('Angular checkout');
    await expect(diagram).toContainText('Order API');
    await expect(diagram).toContainText('Durable workflow');
    await expect(diagram).toContainText(
      'Checkout submits an order to the API, which starts the durable workflow.',
    );

    await expect(lesson.getByRole('region', { name: 'Worked example' })).toContainText(
      'Persist first, publish second.',
    );
    await expect(lesson.getByRole('definition')).toContainText(
      'An order committed before asynchronous processing begins.',
    );
    await expect(lesson.getByRole('region', { name: 'Knowledge check' })).toContainText(
      'Which boundary makes downstream processing safe to retry?',
    );
  }

  async expectRevisionBoundCodeReference(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Open source context for OrderController.Create' })
      .click();
    const source = this.page.getByRole('complementary', { name: 'Source context' });
    await expect(source).toContainText('src/Order.Api/Controllers/OrderController.cs');
    await expect(source).toContainText('main@8f24c1a');
    await expect(source).toContainText('Internal');
    await expect(source).toContainText('await bus.Publish(new OrderSubmitted(order.Id));');
    await expect(source).toContainText('Captured from the declared order-service snapshot.');
    await this.page.getByRole('button', { name: 'Close source context' }).click();
  }

  async expectOrderedCodeTour(): Promise<void> {
    const tour = this.page.getByRole('region', { name: 'Code tour Checkout to durable order' });
    await expect(tour.getByRole('listitem')).toHaveCount(2);
    await expect(tour.getByRole('listitem').nth(0)).toContainText('01 · Submit checkout');
    await expect(tour.getByRole('listitem').nth(0)).toContainText(
      'storefront · src/app/checkout/checkout.service.ts',
    );
    await expect(tour.getByRole('listitem').nth(0)).toContainText('release/checkout@91be440');
    await expect(tour.getByRole('listitem').nth(1)).toContainText('02 · Publish durable handoff');
    await expect(tour.getByRole('listitem').nth(1)).toContainText(
      'order-service · src/Order.Api/Controllers/OrderController.cs',
    );
    await expect(tour.getByRole('listitem').nth(1)).toContainText('main@8f24c1a');
  }

  async uploadAndExpectBlockingIssue(
    packageJson: string,
    code: string,
    path: string,
  ): Promise<void> {
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'unsafe-content.json',
      mimeType: 'application/json',
      buffer: Buffer.from(packageJson),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Validation failed', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    const issue = this.page.getByRole('row').filter({ hasText: code });
    await expect(issue).toContainText(path);
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1900 });
    const lesson = this.page.locator('rf-lesson-renderer');
    await lesson.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        rf-lesson-renderer {
          box-sizing: border-box !important;
          display: block !important;
          height: 1536px !important;
          overflow: hidden !important;
        }
      `,
    });
    await expect(lesson).toHaveScreenshot('define-safe-content-and-code.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
