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

## Offline boundary

Schema resolution, examples, instructions, validation, checksums, and
documentation are local to this directory. Network-dependent source acquisition
is optional, is disabled by default, and is not part of validation.
