import { expect, test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { CurriculumValidationPage } from './pages/curriculum-validation.page';

// Traces to: L2-CLI-01, L2-CLI-02, L2-CLI-03, L2-CLI-04.
test('a local receipt binds validation versions issues and warning acknowledgement', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const curriculum = new CurriculumValidationPage(page);

  await curriculum.open();
  await appShell.actAs('author');
  await curriculum.uploadRepresentativePackage();
  await curriculum.expectVersionedValidationEvidence();

  await appShell.actAs('reviewer');
  await curriculum.expectVersionedValidationEvidence();
  await curriculum.acknowledgeExactWarnings();
  await curriculum.expectVisualContract();
});

test('executable-shaped content is rejected before a receipt is created', async ({ request }) => {
  const response = await request.post('http://127.0.0.1:5080/api/curriculum-imports', {
    headers: { 'X-RepoFluent-Dev-User': 'author' },
    multipart: {
      package: {
        name: 'unsafe-package.json',
        mimeType: 'application/json',
        buffer: Buffer.from('MZ executable-shaped fixture'),
      },
    },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    title: 'CLI_UNSAFE_CONTENT',
    code: 'CLI_UNSAFE_CONTENT',
  });
});
