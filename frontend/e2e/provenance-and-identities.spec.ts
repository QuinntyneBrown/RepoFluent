import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { ProvenanceAndIdentitiesPage } from './pages/provenance-and-identities.page';

const packagePath = path.resolve(
  process.cwd(),
  '..',
  'contracts/curriculum/0.1.0/fixtures/order-processing.json',
);

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-CIC-07, L2-CIC-08, L2-CIC-09.
test('declared evidence, uncertainty, stable identities, and canonical values remain portable', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const provenance = new ProvenanceAndIdentitiesPage(page);
  const packageBody = await buildProvenancePackage();

  await appShell.open();
  await appShell.actAs('author');
  await provenance.uploadAndInspect(JSON.stringify(packageBody));
  await provenance.expectEvidenceAndUncertainty();
  await provenance.expectCanonicalIdentityRules();
  await provenance.expectVisualContract();
});

test('invalid citations, duplicate identities, and non-canonical primitives report every path', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const provenance = new ProvenanceAndIdentitiesPage(page);

  await appShell.open();
  await appShell.actAs('author');

  const invalidCitation = await buildProvenancePackage();
  invalidCitation.courses[0].modules[0].lessons[0].blocks[0].evidence.citations[0].sourceId =
    'undeclared-repository';
  await provenance.uploadAndExpectIssues(JSON.stringify(invalidCitation), [
    {
      code: 'CIC_DANGLING_CITATION',
      path: '/courses/0/modules/0/lessons/0/blocks/0/evidence/citations/0/sourceId',
    },
  ]);

  const duplicateIdentity = await buildProvenancePackage();
  duplicateIdentity.courses[0].modules[0].id = duplicateIdentity.courses[0].id;
  await provenance.uploadAndExpectIssues(JSON.stringify(duplicateIdentity), [
    { code: 'CIC_DUPLICATE_ID', path: '/courses/0/id' },
    { code: 'CIC_DUPLICATE_ID', path: '/courses/0/modules/0/id' },
  ]);

  const nonCanonical = await buildProvenancePackage();
  nonCanonical.packageId = 'Order_Processing';
  nonCanonical.locale = 'en-ca';
  nonCanonical.createdAt = '2026-07-23T08:00:00-04:00';
  await provenance.uploadAndExpectIssues(JSON.stringify(nonCanonical), [
    { code: 'CIC_INVALID_ID', path: '/packageId' },
    { code: 'CIC_UNSUPPORTED_LOCALE', path: '/locale' },
    { code: 'CIC_NON_CANONICAL_DATE_TIME', path: '/createdAt' },
  ]);
});

async function buildProvenancePackage() {
  const packageBody = JSON.parse(await readFile(packagePath, 'utf8'));
  const evidence = {
    confidence: 'high',
    citations: [
      {
        sourceId: 'order-service',
        document: 'docs/orders.md',
        locator: 'durable-handoff',
        evidenceType: 'direct',
      },
    ],
    assumptions: ['The supplied snapshot describes the persistence boundary.'],
    omissions: ['Payment orchestration is outside this package.'],
    conflictingSources: ['The legacy runbook describes publication before persistence.'],
    unresolvedQuestions: ['Which retry policy owns terminal failures?'],
  };
  packageBody.evidence = evidence;
  packageBody.courses[0].objectives[0].evidence = evidence;
  packageBody.courses[0].modules[0].lessons[0].blocks[0].evidence = evidence;
  packageBody.assessments[0].pools[0].items[0].evidence = evidence;
  return packageBody;
}
