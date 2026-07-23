import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CurriculumDraftImportPage } from './pages/curriculum-draft-import.page';

// Traces to: L2-CLI-05, L2-CLI-12.
test('identical package identity version and bytes converge on one complete draft', async ({
  page,
}) => {
  const curriculum = new CurriculumDraftImportPage(page);
  await curriculum.openAsAuthor();

  const original = await curriculum.uploadPackage();
  expect(original.isReplay).toBe(false);
  await curriculum.expectStableAndPlatformIdentities();

  const replay = await curriculum.uploadPackage();
  expect(replay.isReplay).toBe(true);
  expect(replay.id).toBe(original.id);
  expect(replay.checksum).toBe(original.checksum);
  await curriculum.expectExistingDraftReused();
  await curriculum.expectVisualContract();
});

test('reused package identity and version with different bytes is a conflict', async ({
  request,
}) => {
  const fixturePath = path.resolve(
    process.cwd(),
    '..',
    'contracts/curriculum/0.1.0/fixtures/order-processing.json',
  );
  const originalPackage = JSON.parse(await readFile(fixturePath, 'utf8')) as {
    packageId: string;
    description: string;
  };
  originalPackage.packageId = 'idempotency-conflict-foundations';
  const original = JSON.stringify(originalPackage);
  const changed = JSON.stringify({
    ...originalPackage,
    description: 'Learn how changed checkout content becomes a durable .NET workflow.',
  });

  const upload = async (body: string) =>
    request.post('http://127.0.0.1:5080/api/curriculum-imports', {
      headers: { 'X-RepoFluent-Dev-User': 'author' },
      multipart: {
        package: {
          name: 'order-processing.json',
          mimeType: 'application/json',
          buffer: Buffer.from(body),
        },
      },
    });

  const accepted = await upload(original);
  expect(accepted.status()).toBe(202);
  const receipt = (await accepted.json()) as { id: string };
  for (let attempt = 0; attempt < 50; attempt++) {
    const status = await request.get(`http://127.0.0.1:5080/api/curriculum-imports/${receipt.id}`, {
      headers: { 'X-RepoFluent-Dev-User': 'author' },
    });
    if (((await status.json()) as { status: string }).status === 'Draft') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const conflict = await upload(changed);
  expect(conflict.status()).toBe(409);
  await expect(conflict.json()).resolves.toMatchObject({
    title: 'CLI_PACKAGE_VERSION_CONFLICT',
    code: 'CLI_PACKAGE_VERSION_CONFLICT',
  });
});
