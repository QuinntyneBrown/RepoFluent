import { expect, type Page } from '@playwright/test';

export class CurriculumImportsPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();
  }

  async upload(packagePath: string): Promise<string> {
    await this.page.getByLabel('Curriculum package').setInputFiles(packagePath);
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();

    const checksum = await this.page.getByTestId('curriculum-checksum').textContent();
    expect(checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
    return checksum!;
  }

  async previewDraft(expectedLessonTitle: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Preview draft' }).click();
    await expect(this.page.getByText('Draft preview', { exact: true })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: expectedLessonTitle })).toBeVisible();
  }

  async approveDraft(): Promise<void> {
    await this.page.getByRole('button', { name: 'Approve this checksum' }).click();
    await expect(this.page.getByText('Approved', { exact: true })).toBeVisible();
  }

  async publish(): Promise<void> {
    await this.page.getByRole('button', { name: 'Publish version' }).click();
    await expect(this.page.getByText('Published', { exact: true })).toBeVisible();
  }

  async assignRequiredCourse(learnerId: string): Promise<void> {
    await this.page.getByLabel('Learner').selectOption(learnerId);
    await this.page.getByLabel('Required assignment').check();
    await this.page.getByRole('button', { name: 'Assign learner' }).click();
    await expect(this.page.getByRole('status', { name: 'Curriculum operation status' })).toHaveText(
      'Assignment created',
    );
  }
}
