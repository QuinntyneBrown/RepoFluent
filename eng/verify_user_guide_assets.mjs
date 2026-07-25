#!/usr/bin/env node

// Verifies that the user-guide site's vendored design-system stylesheets are
// byte-identical to their sources in desigh-system/assets.
//
// The user-guide site is deployed on its own (app_location: user-guides), so it
// cannot reference ../desigh-system at runtime and keeps local copies instead.
// This gate stops those copies from silently drifting away from the brand.
//
//   node eng/verify_user_guide_assets.mjs          verify, exit 1 on drift
//   node eng/verify_user_guide_assets.mjs --fix    re-copy from the source

import { createHash } from "node:crypto";
import { copyFileSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = join(repositoryRoot, "desigh-system", "assets");
const vendorDirectory = join(
  repositoryRoot,
  "user-guides",
  "assets",
  "vendor",
);

const vendoredStylesheets = ["tokens.css", "components.css"];

function checksum(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function displayPath(filePath) {
  return relative(repositoryRoot, filePath).split("\\").join("/");
}

function main() {
  const shouldFix = process.argv.includes("--fix");
  const problems = [];

  for (const stylesheet of vendoredStylesheets) {
    const source = join(sourceDirectory, stylesheet);
    const vendored = join(vendorDirectory, stylesheet);

    let sourceChecksum;
    try {
      sourceChecksum = checksum(source);
    } catch {
      problems.push(`missing design-system source ${displayPath(source)}`);
      continue;
    }

    if (shouldFix) {
      copyFileSync(source, vendored);
      console.log(
        `copied ${displayPath(source)} -> ${displayPath(vendored)} ` +
          `(sha256:${sourceChecksum.slice(0, 12)})`,
      );
      continue;
    }

    let vendoredChecksum;
    try {
      vendoredChecksum = checksum(vendored);
    } catch {
      problems.push(`missing vendored copy ${displayPath(vendored)}`);
      continue;
    }

    if (vendoredChecksum !== sourceChecksum) {
      problems.push(
        `${displayPath(vendored)} has drifted from ` +
          `${displayPath(source)} ` +
          `(source sha256:${sourceChecksum.slice(0, 12)}, ` +
          `vendored sha256:${vendoredChecksum.slice(0, 12)})`,
      );
      continue;
    }

    console.log(
      `ok ${displayPath(vendored)} sha256:${sourceChecksum.slice(0, 12)}`,
    );
  }

  if (problems.length > 0) {
    console.error("\nUser-guide vendored asset verification failed:");
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error(
      "\nRun `node eng/verify_user_guide_assets.mjs --fix` to re-copy the " +
        "design-system stylesheets, then review and commit the result.",
    );
    process.exit(1);
  }

  console.log(
    shouldFix
      ? "User-guide vendored assets refreshed."
      : "User-guide vendored assets match the design system.",
  );
}

main();
