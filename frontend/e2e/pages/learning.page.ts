import { expect, type Page } from '@playwright/test';

export class LearningPage {
  constructor(private readonly page: Page) {}

  async expectRequiredAssignment(courseTitle: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'My learning' })).toBeVisible();
    await expect(this.page.getByText(courseTitle)).toBeVisible();
    await expect(this.page.getByText('Required', { exact: true })).toBeVisible();
  }

  async startCourse(courseTitle: string): Promise<void> {
    await this.page.getByRole('link', { name: 'Start course' }).click();
    await expect(this.page.getByRole('heading', { name: courseTitle })).toBeVisible();
  }

  async openLesson(lessonTitle: string): Promise<void> {
    await this.page.getByRole('link', { name: lessonTitle }).click();
    await expect(this.page.getByRole('heading', { name: lessonTitle })).toBeVisible();
  }

  async expectCodeReference(path: string): Promise<void> {
    await expect(this.page.getByText(path)).toBeVisible();
  }
}
