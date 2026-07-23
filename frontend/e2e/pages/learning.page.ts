import { expect, type Page } from '@playwright/test';

export class LearningPage {
  constructor(private readonly page: Page) {}

  async expectRequiredAssignment(courseTitle: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'My learning' })).toBeVisible();
    const assignment = this.page.locator('article.assignment-card').filter({
      has: this.page.getByRole('heading', { name: courseTitle, exact: true }),
    });
    await expect(assignment).toBeVisible();
    await expect(assignment.getByText('Required', { exact: true })).toBeVisible();
  }

  async startCourse(courseTitle: string): Promise<void> {
    const assignment = this.page.locator('article.assignment-card').filter({
      has: this.page.getByRole('heading', { name: courseTitle, exact: true }),
    });
    await assignment.getByRole('link', { name: 'Start course' }).click();
    await expect(this.page.getByRole('heading', { name: courseTitle })).toBeVisible();
  }

  async openLesson(lessonTitle: string): Promise<void> {
    await this.page.getByRole('link', { name: lessonTitle }).click();
    await expect(this.page.getByRole('heading', { name: lessonTitle })).toBeVisible();
  }

  async expectCodeReference(path: string): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Open source context for OrderController.Create' })
      .click();
    await expect(
      this.page.getByRole('complementary', { name: 'Source context' }).getByText(path),
    ).toBeVisible();
  }
}
