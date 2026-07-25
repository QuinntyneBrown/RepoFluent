import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
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
    curriculumPackage.packageId = `responsive-navigation-${randomUUID()}`;
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

    let draft: {
      checksum: string;
      status: string;
      validationReport: { issueChecksum: string; warningCount: number };
    } | null = null;
    for (let attempt = 0; attempt < 50; attempt++) {
      const response = await request.get(`${this.apiBaseUrl}/curriculum-imports/${receipt.id}`, {
        headers: this.personaHeaders('author'),
      });
      const status = (await response.json()) as {
        checksum: string;
        status: string;
        validationReport: { issueChecksum: string; warningCount: number };
      };
      if (status.status === 'Draft') {
        draft = status;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(draft?.status).toBe('Draft');

    if (draft!.validationReport.warningCount > 0) {
      const acknowledgement = await request.post(
        `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/warning-acknowledgements`,
        {
          headers: this.personaHeaders('reviewer'),
          data: {
            packageChecksum: draft!.checksum,
            issueChecksum: draft!.validationReport.issueChecksum,
            rationale: 'Reviewed the exact warning set for this acceptance fixture.',
          },
        },
      );
      expect(acknowledgement.ok()).toBeTruthy();
    }

    const review = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/review-decisions`,
      {
        headers: this.personaHeaders('reviewer'),
        data: {
          decision: 'approved',
          checksum: draft!.checksum,
          validationIssueChecksum: draft!.validationReport.issueChecksum,
          rationale: 'Reviewed production rendering and the exact validation evidence.',
        },
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

  async expectPinnedChromeWhileScrolling(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const geometry = await this.page.evaluate(() => {
      const banner = document.querySelector<HTMLElement>('.development-banner')!;
      const header = document.querySelector<HTMLElement>('.app-header')!;
      const bannerBox = banner.getBoundingClientRect();
      const headerBox = header.getBoundingClientRect();
      const covered = document.elementFromPoint(
        headerBox.left + headerBox.width / 2,
        headerBox.top + headerBox.height / 2,
      );
      return {
        bannerTop: Math.round(bannerBox.top),
        bannerBottom: Math.round(bannerBox.bottom),
        headerTop: Math.round(headerBox.top),
        chromeHeight: Math.round(bannerBox.height + headerBox.height),
        headerPaintsOverContent: header.contains(covered),
        scrollOffset: Math.round(window.scrollY),
        scrollPaddingTop: Math.round(
          parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
        ),
      };
    });

    expect(geometry.scrollOffset).toBeGreaterThan(0);
    expect(geometry.bannerTop).toBe(0);
    expect(geometry.headerTop).toBe(geometry.bannerBottom);
    expect(geometry.headerPaintsOverContent).toBe(true);
    expect(geometry.scrollPaddingTop).toBe(geometry.chromeHeight);

    await expect(this.page.getByRole('heading', { name: 'RepoFluent', exact: true })).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: 'Search curriculum, code, and systems' }),
    ).toBeVisible();
    await expect(this.page.getByLabel('Development persona')).toBeVisible();

    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // The pinned chrome — development banner, header, navigation rails, and the
  // bottom dock — must fit the viewport by itself so that no part of it spends
  // scroll distance the page content did not ask for. Collapsing the routed
  // content isolates the chrome from whatever the current page renders.
  async expectPinnedChromeFitsViewport(): Promise<void> {
    const collapsedContent = await this.page.addStyleTag({
      content: '#main-content { display: none !important; }',
    });
    const geometry = await this.page.evaluate(() => {
      const root = document.scrollingElement!;
      const bannerBox = document
        .querySelector<HTMLElement>('.development-banner')!
        .getBoundingClientRect();
      return {
        verticalOverflow: root.scrollHeight - root.clientHeight,
        bannerTop: Math.round(bannerBox.top),
        bannerHeight: Math.round(bannerBox.height),
      };
    });
    await collapsedContent.evaluate((node) => node.parentNode?.removeChild(node));

    expect(geometry.bannerHeight).toBeGreaterThan(0);
    expect(geometry.bannerTop).toBe(0);
    expect(geometry.verticalOverflow).toBe(0);
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
