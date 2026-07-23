import { expect, test } from '@playwright/test';
import path from 'node:path';

// Traces to: L2-CLI-01, L2-CLI-05, L2-CLI-06, L2-CLI-07, L2-CLI-08,
// L2-ATO-05, L2-LEX-01, L2-LEX-03, L2-LEX-04.
test('a governed curriculum becomes an assigned learning experience', async ({ page, request }) => {
  const health = await request.get('http://127.0.0.1:5080/api/health');
  expect(health.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'RepoFluent', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();

  await page.getByLabel('Development persona').selectOption('author');
  await page
    .getByLabel('Curriculum package')
    .setInputFiles(
      path.resolve(
        process.cwd(),
        '..',
        'contracts/curriculum/0.1.0/fixtures/order-processing.json',
      ),
    );
  await page.getByRole('button', { name: 'Upload and validate' }).click();
  await expect(page.getByText('Ready for review')).toBeVisible();
  const checksum = await page.getByTestId('curriculum-checksum').textContent();
  expect(checksum).toMatch(/^sha256:[a-f0-9]{64}$/);

  await page.getByLabel('Development persona').selectOption('reviewer');
  await page.getByRole('button', { name: 'Preview draft' }).click();
  await expect(page.getByText('Draft preview')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'How an order becomes a workflow' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Approve this checksum' }).click();
  await expect(page.getByText('Approved')).toBeVisible();

  await page.getByLabel('Development persona').selectOption('administrator');
  await page.getByRole('button', { name: 'Publish version' }).click();
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await page.getByLabel('Learner').selectOption('learner');
  await page.getByLabel('Required assignment').check();
  await page.getByRole('button', { name: 'Assign learner' }).click();
  await expect(page.getByText('Assignment created')).toBeVisible();

  await page.getByLabel('Development persona').selectOption('learner');
  await page.getByRole('link', { name: 'My learning' }).click();
  await expect(page.getByRole('heading', { name: 'My learning' })).toBeVisible();
  await expect(page.getByText('Order Processing Foundations')).toBeVisible();
  await expect(page.getByText('Required', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Start course' }).click();

  await expect(page.getByRole('heading', { name: 'Order Processing Foundations' })).toBeVisible();
  await page.getByRole('link', { name: 'How an order becomes a workflow' }).click();
  await expect(
    page.getByRole('heading', { name: 'How an order becomes a workflow' }),
  ).toBeVisible();
  await expect(page.getByText('src/Order.Api/Controllers/OrderController.cs')).toBeVisible();
});
