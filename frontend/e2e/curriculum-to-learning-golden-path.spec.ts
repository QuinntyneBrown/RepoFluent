import { expect, test } from '@playwright/test';
import path from 'node:path';
import { AppShellPage } from './pages/app-shell.page';
import { CurriculumImportsPage } from './pages/curriculum-imports.page';
import { LearningPage } from './pages/learning.page';

// Traces to: L2-CLI-01, L2-CLI-05, L2-CLI-06, L2-CLI-07, L2-CLI-08,
// L2-ATO-05, L2-LEX-01, L2-LEX-03, L2-LEX-04.
test('a governed curriculum becomes an assigned learning experience', async ({ page, request }) => {
  const appShell = new AppShellPage(page);
  const curriculumImports = new CurriculumImportsPage(page);
  const learning = new LearningPage(page);
  const lessonTitle = 'How an order becomes a workflow';
  const courseTitle = 'Order Processing Foundations';
  const curriculumPackage = path.resolve(
    process.cwd(),
    '..',
    'contracts/curriculum/0.1.0/fixtures/order-processing.json',
  );

  const health = await request.get('http://127.0.0.1:5080/api/health');
  expect(health.ok()).toBeTruthy();

  await appShell.open();
  await curriculumImports.expectLoaded();

  await test.step('the author imports a valid curriculum package', async () => {
    await appShell.actAs('author');
    await curriculumImports.upload(curriculumPackage);
  });

  await test.step('a different reviewer previews and approves the draft', async () => {
    await appShell.actAs('reviewer');
    await curriculumImports.previewDraft(lessonTitle);
    await curriculumImports.approveDraft();
  });

  await test.step('an administrator publishes and assigns the course', async () => {
    await appShell.actAs('administrator');
    await curriculumImports.publish();
    await curriculumImports.assignRequiredCourse('learner');
  });

  await test.step('the learner opens the assigned lesson', async () => {
    await appShell.actAs('learner');
    await appShell.openMyLearning();
    await learning.expectRequiredAssignment(courseTitle);
    await learning.startCourse(courseTitle);
    await learning.openLesson(lessonTitle);
    await learning.expectCodeReference('src/Order.Api/Controllers/OrderController.cs');
  });
});
