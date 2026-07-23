import path from 'node:path';
import { test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { CurriculumContractPage } from './pages/curriculum-contract.page';

// Traces to: L2-CIC-02, L2-CIC-03, L2-CIC-06.
test('a complete curriculum package remains typed, explainable, and safe', async ({ page }) => {
  const appShell = new AppShellPage(page);
  const contract = new CurriculumContractPage(page);
  const packagePath = path.resolve(
    process.cwd(),
    'e2e',
    'fixtures',
    'modeled-curriculum-package.json',
  );

  await appShell.open();
  await appShell.actAs('author');
  await contract.inspectModeledPackage(packagePath);
  await contract.expectMetadataAndSourceSnapshot();
  await contract.expectArchitectureAndLearningModel();
  await contract.expectAssessmentModelKeepsAnswersProtected();
  await contract.expectVisualContract();
});
