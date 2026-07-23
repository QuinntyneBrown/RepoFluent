# RepoFluent authoring kit 0.1.0

This prerelease guides an approved curriculum-authoring agent from declared
source material to a RepoFluent Curriculum Input Contract `0.1.0` package.

## Runtime

Install Node.js 22 or later. The release contains no package dependencies and
does not run package installation.

## Quick start

From this release directory, verify every declared artifact:

```sh
node scripts/verify-release.mjs
```

Validate the representative package:

```sh
node scripts/validate.mjs examples/valid/order-processing.json
```

The command prints `{"valid":true,"issues":[]}` and exits with status `0`.
Invalid input prints path-addressed schema issues and exits with status `1`.

Run scope preflight before reading an approved repository:

```sh
node scripts/preflight.mjs examples/scope/approved-scope.json
```

Preflight resolves root-to-directory `AGENTS.md` policies, applies explicit
exclusions, requires the repository revision and document scope, and scans the
effective files for suspected credentials. A blocking report contains paths and
safe codes but not the suspected value.

Validate source associations and uncertainty before package validation:

```sh
node scripts/validate-evidence.mjs \
  examples/evidence/valid-evidence-report.json \
  examples/scope/approved-scope.json
```

The command reruns scope preflight, binds citations to repository revisions,
effective paths, file hashes, and line ranges, then requires structured material
uncertainty to remain visible in the package.

## Offline boundary

Schema resolution, examples, instructions, validation, checksums, and
documentation are local to this directory. Network-dependent source acquisition
is optional, is disabled by default, and is not part of validation.
