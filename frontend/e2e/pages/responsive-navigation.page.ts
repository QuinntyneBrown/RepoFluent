import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

export class ResponsiveNavigationPage {
  private readonly apiBaseUrl = `${
    process.env['REPOFLUENT_API_BASE_URL'] ?? 'http://127.0.0.1:5080'
  }/api`;

  constructor(private readonly page: Page) {}

  async createLargeAssignedLesson(
    request: APIRequestContext,
    packagePath: string,
  ): Promise<string> {
    const curriculumPackage = JSON.parse(await readFile(packagePath, 'utf8')) as {
      packageId: string;
      title: string;
      courses: Array<{
        id: string;
        title: string;
        modules: Array<{
          lessons: Array<{
            id: string;
            blocks: Array<Record<string, unknown>>;
          }>;
        }>;
      }>;
    };
    curriculumPackage.packageId = 'responsive-navigation-foundations';
    curriculumPackage.title = 'Responsive Navigation Foundations';
    curriculumPackage.courses[0]!.title = 'Responsive Navigation Foundations';
    const lesson = curriculumPackage.courses[0]!.modules[0]!.lessons[0]!;
    for (let index = 1; index <= 30; index++) {
      lesson.blocks.push({
        type: 'prose',
        text: `Progressive lesson block ${index.toString().padStart(2, '0')}`,
      });
    }

    const upload = await request.post(`${this.apiBaseUrl}/curriculum-imports`, {
      headers: this.personaHeaders('author'),
      multipart: {
        package: {
          name: 'large-order-processing.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(curriculumPackage)),
        },
      },
    });
    expect(upload.ok()).toBeTruthy();
    const receipt = (await upload.json()) as { id: string };

    let draft: { checksum: string; status: string } | null = null;
    for (let attempt = 0; attempt < 50; attempt++) {
      const response = await request.get(`${this.apiBaseUrl}/curriculum-imports/${receipt.id}`, {
        headers: this.personaHeaders('author'),
      });
      const status = (await response.json()) as { checksum: string; status: string };
      if (status.status === 'Draft') {
        draft = status;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(draft?.status).toBe('Draft');

    const review = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/review-decisions`,
      {
        headers: this.personaHeaders('reviewer'),
        data: { decision: 'approved', checksum: draft!.checksum },
      },
    );
    expect(review.ok()).toBeTruthy();

    const publish = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/publish`,
      {
        headers: this.personaHeaders('administrator'),
        data: {},
      },
    );
    expect(publish.ok()).toBeTruthy();
    const published = (await publish.json()) as { publishedVersionId: string };

    const assignment = await request.post(`${this.apiBaseUrl}/assignments`, {
      headers: this.personaHeaders('administrator'),
      data: {
        publishedVersionId: published.publishedVersionId,
        learnerId: 'learner',
        isRequired: true,
      },
    });
    expect(assignment.ok()).toBeTruthy();

    return `/learning/versions/${published.publishedVersionId}/courses/${
      curriculumPackage.courses[0]!.id
    }/lessons/${lesson.id}`;
  }

  async openAssignedLesson(url: string): Promise<void> {
    await this.page.addInitScript(() => {
      localStorage.setItem('repofluent-development-persona', 'learner');
    });
    await this.page.goto(url);
    await expect(
      this.page.getByRole('heading', { name: 'How an order becomes a workflow' }),
    ).toBeVisible();
  }

  async expectProgressiveContent(totalBlocks: number): Promise<void> {
    await expect(this.page.getByRole('status', { name: 'Lesson content progress' })).toHaveText(
      `Showing 10 of ${totalBlocks} lesson blocks`,
    );
    await expect(
      this.page.getByRole('button', { name: 'Show 10 more lesson blocks' }),
    ).toBeVisible();
  }

  async revealAllContent(totalBlocks: number): Promise<void> {
    let visibleBlocks = 10;
    while (visibleBlocks < totalBlocks) {
      const nextBlock = visibleBlocks;
      await this.page.getByRole('button', { name: /Show \d+ more lesson blocks/ }).click();
      await expect(this.page.locator(`[data-block-index="${nextBlock}"]`)).toBeFocused();
      visibleBlocks = Math.min(visibleBlocks + 10, totalBlocks);
      await expect(this.page.getByRole('status', { name: 'Lesson content progress' })).toHaveText(
        `Showing ${visibleBlocks} of ${totalBlocks} lesson blocks`,
      );
    }
    await expect(this.page.getByRole('button', { name: /more lesson blocks/ })).toHaveCount(0);
  }

  async openSourceContext(): Promise<void> {
    const trigger = this.page.getByRole('button', {
      name: 'Open source context for OrderController.Create',
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    await expect(this.page).toHaveURL(/[?&]source=2(?:&|$)/);
    await expect(this.page.getByRole('complementary', { name: 'Source context' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Close source context' })).toBeFocused();
  }

  async closeSourceWithBrowserBack(): Promise<void> {
    await this.page.goBack();
    await expect(this.page.getByRole('complementary', { name: 'Source context' })).toBeHidden();
    await expect(
      this.page.getByRole('button', {
        name: 'Open source context for OrderController.Create',
      }),
    ).toBeFocused();
    await expect(this.page).not.toHaveURL(/[?&]source=/);
  }

  async closeSourceWithControl(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close source context' }).click();
    await expect(this.page.getByRole('complementary', { name: 'Source context' })).toBeHidden();
    await expect(
      this.page.getByRole('button', {
        name: 'Open source context for OrderController.Create',
      }),
    ).toBeFocused();
  }

  async expectDesktopSplitLayout(): Promise<void> {
    const layout = await this.page.locator('.lesson').evaluate((lesson) => {
      const source = lesson.querySelector<HTMLElement>('.lesson__source')!;
      return {
        columns: getComputedStyle(lesson).gridTemplateColumns.split(' ').length,
        display: getComputedStyle(lesson).display,
        sourcePosition: getComputedStyle(source).position,
      };
    });
    expect(layout).toEqual({
      columns: 2,
      display: 'grid',
      sourcePosition: 'static',
    });
  }

  async expectNarrowDrawerLayout(): Promise<void> {
    const layout = await this.page
      .getByRole('complementary', { name: 'Source context' })
      .evaluate((source) => ({
        position: getComputedStyle(source).position,
        width: source.getBoundingClientRect().width,
      }));
    expect(layout.position).toBe('fixed');
    expect(layout.width).toBeLessThanOrEqual(390);
    expect(layout.width).toBeGreaterThanOrEqual(389);
  }

  async useNarrowViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 390, height: 844 });
  }

  async useHighZoomEquivalentViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 640, height: 900 });
  }

  async expectNoPageOverflow(): Promise<void> {
    const overflow = await this.page.locator('html').evaluate((root) => {
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  }

  async expectScreenshot(name: string, maxDiffPixelRatio = 0.015): Promise<void> {
    await expect(this.page).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio,
    });
  }

  private personaHeaders(persona: string): Record<string, string> {
    return { 'X-RepoFluent-Dev-User': persona };
  }
}
