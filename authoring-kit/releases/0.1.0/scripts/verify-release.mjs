import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const releaseRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifest = JSON.parse(
  await readFile(path.join(releaseRoot, "manifest.json"), "utf8"),
);
const checksumPairs = [];

for (const artifact of manifest.artifacts) {
  const bytes = await readFile(path.join(releaseRoot, artifact.path));
  const checksum = createHash("sha256").update(bytes).digest("hex");
  if (checksum !== artifact.sha256) {
    throw new Error(`Checksum mismatch: ${artifact.path}`);
  }
  checksumPairs.push([artifact.path, checksum]);
}

const checksumInput = checksumPairs
  .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  .map(([artifactPath, checksum]) => `${artifactPath}:${checksum}\n`)
  .join("");
const releaseChecksum = createHash("sha256")
  .update(checksumInput)
  .digest("hex");
if (manifest.releaseChecksum !== `sha256:${releaseChecksum}`) {
  throw new Error("Release checksum mismatch.");
}

console.log(`Authoring kit ${manifest.kitVersion} verified for offline use.`);
