import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { SafeContentAndCodePage } from './pages/safe-content-and-code.page';

const packagePath = path.resolve(
  process.cwd(),
  '..',
  'contracts/curriculum/0.1.0/fixtures/order-processing.json',
);

test.describe.configure({ timeout: 60_000 });

// Traces to: L2-CIC-04, L2-CIC-05.
test('safe lesson blocks and revision-bound code tours remain portable', async ({ page }) => {
  const appShell = new AppShellPage(page);
  const safeContent = new SafeContentAndCodePage(page);
  const packageBody = await buildSafePackage('safe-content-code-portable');

  await appShell.open();
  await appShell.actAs('author');
  await safeContent.uploadAndPreview(JSON.stringify(packageBody));
  await safeContent.expectAllowListedVocabulary();
  await safeContent.expectRevisionBoundCodeReference();
  await safeContent.expectOrderedCodeTour();
  await safeContent.expectVisualContract();
});

test('active and undeclared remote content is rejected at the exact block path', async ({
  page,
}) => {
  const appShell = new AppShellPage(page);
  const safeContent = new SafeContentAndCodePage(page);
  const activeContent = await buildSafePackage('safe-content-active-rejection');
  activeContent.courses[0].modules[0].lessons[0].blocks[1].text =
    '<script>window.location = "https://untrusted.example"</script>';

  await appShell.open();
  await appShell.actAs('author');
  await safeContent.uploadAndExpectBlockingIssue(
    JSON.stringify(activeContent),
    'CIC_ACTIVE_CONTENT',
    '/courses/0/modules/0/lessons/0/blocks/1/text',
  );

  const remoteContent = await buildSafePackage('safe-content-remote-rejection');
  remoteContent.courses[0].modules[0].lessons[0].blocks[2].resourceUrl =
    'https://untrusted.example/order-flow.svg';
  await safeContent.uploadAndExpectBlockingIssue(
    JSON.stringify(remoteContent),
    'CIC_UNDECLARED_RESOURCE',
    '/courses/0/modules/0/lessons/0/blocks/2/resourceUrl',
  );
});

async function buildSafePackage(packageId: string) {
  const packageBody = JSON.parse(await readFile(packagePath, 'utf8'));
  packageBody.packageId = packageId;
  packageBody.courses[0].modules[0].lessons[0].blocks = [
    {
      type: 'prose',
      text: 'A safe lesson connects structured explanation to revision-bound evidence.',
    },
    {
      type: 'callout',
      tone: 'information',
      title: 'Architecture note',
      text: 'Publishing after persistence creates a durable handoff.',
    },
    {
      type: 'diagram',
      title: 'Order submission flow',
      description: 'Checkout submits an order to the API, which starts the durable workflow.',
      alternativeText: 'Angular checkout flows to the Order API and then to the durable workflow.',
      labels: ['Angular checkout', 'Order API', 'Durable workflow'],
    },
    {
      type: 'codeReference',
      repositoryId: 'order-service',
      path: 'src/Order.Api/Controllers/OrderController.cs',
      branch: 'main',
      commit: '8f24c1a',
      language: 'csharp',
      startLine: 53,
      endLine: 54,
      symbol: 'OrderController.Create',
      excerpt: 'await bus.Publish(new OrderSubmitted(order.Id));',
      contentClassification: 'internal',
      explanation: 'The controller publishes only after the order is durable.',
      provenance: 'Captured from the declared order-service snapshot.',
    },
    {
      type: 'codeTour',
      title: 'Checkout to durable order',
      steps: [
        {
          order: 1,
          title: 'Submit checkout',
          guidance: 'Start where Angular turns the basket into an order command.',
          repositoryId: 'storefront',
          path: 'src/app/checkout/checkout.service.ts',
          branch: 'release/checkout',
          commit: '91be440',
          language: 'typescript',
          startLine: 24,
          endLine: 38,
          symbol: 'CheckoutService.submit',
          excerpt: 'return this.http.post<Order>("/api/orders", command);',
          contentClassification: 'internal',
          provenance: 'Captured from the declared storefront snapshot.',
        },
        {
          order: 2,
          title: 'Publish durable handoff',
          guidance: 'Continue where the API publishes work after persistence.',
          repositoryId: 'order-service',
          path: 'src/Order.Api/Controllers/OrderController.cs',
          branch: 'main',
          commit: '8f24c1a',
          language: 'csharp',
          startLine: 42,
          endLine: 57,
          symbol: 'OrderController.Create',
          excerpt: 'await bus.Publish(new OrderSubmitted(order.Id));',
          contentClassification: 'internal',
          provenance: 'Captured from the declared order-service snapshot.',
        },
      ],
    },
    {
      type: 'example',
      title: 'Worked example',
      text: 'Persist first, publish second.',
    },
    {
      type: 'glossaryLink',
      term: 'Durable order',
      definition: 'An order committed before asynchronous processing begins.',
    },
    {
      type: 'knowledgeCheck',
      prompt: 'Which boundary makes downstream processing safe to retry?',
      assessmentId: 'order-workflow-checkpoint',
    },
  ];
  return packageBody;
}
