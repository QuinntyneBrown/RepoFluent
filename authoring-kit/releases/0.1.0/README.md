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

Validate the representative package with the documented interface:

```sh
node scripts/validate.mjs examples/valid/order-processing.json \
  --contract auto \
  --format json \
  --threshold warning
```

The command exits with status `0` for success, `3` for warnings-only, `1` for
package failure, `2` for invalid invocation, and `4` for internal validator
failure. See `guides/local-validation.md` for options, output fields, text
format, threshold behavior, and the validation issue contract.

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

Generate stable identifiers and finalize a safe generation manifest:

```sh
node scripts/generate-identities.mjs examples/identities/regeneration-a.json
node scripts/finalize-generation.mjs \
  examples/generation/completed-run.json \
  examples/valid/order-processing.json
```

Identity inputs exclude display titles from the namespace hash. The manifest
allow-lists tool, model, version, source snapshot, time, checksum, options, and
validation fields without hidden reasoning, credentials, or full prompts.

Verify the supplied C# and Angular analysis profiles:

```sh
node scripts/verify-ecosystem-analysis.mjs \
  dotnet \
  examples/analysis/dotnet-analysis.json
node scripts/verify-ecosystem-analysis.mjs \
  angular \
  examples/analysis/angular-analysis.json
```

The profile guides define eleven evidence categories per ecosystem. The
verifier resolves every cited path inside the supplied fixture snapshot,
preserves unresolved dynamic .NET registration, and requires five cited Angular
user-to-API steps.

## Offline boundary

Schema resolution, examples, instructions, validation, checksums, and
documentation are local to this directory. Network-dependent source acquisition
is optional, is disabled by default, and is not part of validation.
