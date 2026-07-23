import { expect, type Page } from '@playwright/test';

export type DevelopmentPersona = 'author' | 'reviewer' | 'administrator' | 'learner';

export class AppShellPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'RepoFluent', exact: true })).toBeVisible();
  }

  async actAs(persona: DevelopmentPersona): Promise<void> {
    await this.page.getByLabel('Development persona').selectOption(persona);
  }

  async openMyLearning(): Promise<void> {
    await this.page.getByRole('link', { name: 'My learning' }).click();
  }
}
