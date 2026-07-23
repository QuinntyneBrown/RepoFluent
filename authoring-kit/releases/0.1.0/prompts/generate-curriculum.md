# Generate a RepoFluent curriculum package

Produce one JSON package that conforms to
`contracts/curriculum.schema.json` and the rules in `contracts/ICD.md`.

Before analysis:

- record the approved repositories, documents, revisions, directory scope,
  exclusions, output path, and data-handling constraints;
- discover applicable repository guidance from root to each in-scope source;
- stop and report unresolved instruction conflicts.

Run `node scripts/preflight.mjs <scope.json>`. Do not begin source analysis when
preflight reports a blocking finding.

During generation:

- follow `guides/stable-generation.md`;
- derive stable identifiers from organization, product, source scope, major
  version, entity kind, and semantic key, not display wording;
- stop and report a semantic-key collision instead of overwriting either
  entity;
- follow `guides/citations-and-uncertainty.md`;
- bind claims and objectives to repository, revision, path, file hash, and line
  range;
- classify each claim as direct evidence, synthesis, or interpretation;
- preserve assumptions, confidence, conflicting evidence, missing context,
  omissions, and unresolved questions in the evidence report;
- represent material uncertainty in the package for learners and reviewers;
- keep protected assessment answers out of learner-visible content;
- minimize excerpts, honor classification and redaction metadata, and stop on
  suspected secret exposure without reproducing the value;
- use only inert lesson blocks and repository-relative code references;
- keep producer-specific metadata inside a declared extension namespace.

After generation, run:

```sh
node scripts/validate-evidence.mjs <evidence-report.json> <scope.json>
node scripts/generate-identities.mjs <identities.json>
node scripts/validate.mjs <package.json> \
  --contract auto \
  --format json \
  --threshold warning
node scripts/finalize-generation.mjs <completed-run.json> <package.json>
```

Return the package and safe generation manifest only when validation reports
`valid: true`. Preserve warnings for review. Otherwise return path-addressed
issues without copying source or protected values into the issue text.
