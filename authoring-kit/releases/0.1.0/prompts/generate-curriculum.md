# Generate a RepoFluent curriculum package

Produce one JSON package that conforms to
`contracts/curriculum.schema.json` and the rules in `contracts/ICD.md`.

Before analysis:

- record the approved repositories, documents, revisions, directory scope,
  exclusions, output path, and data-handling constraints;
- discover applicable repository guidance from root to each in-scope source;
- stop and report unresolved instruction conflicts.

During generation:

- derive stable identifiers from semantic source scope, not display wording;
- bind claims to declared snapshot documents when direct evidence exists;
- represent assumptions, omissions, conflicts, and unresolved questions
  explicitly;
- keep protected assessment answers out of learner-visible content;
- use only inert lesson blocks and repository-relative code references;
- keep producer-specific metadata inside a declared extension namespace.

After generation, run:

```sh
node scripts/validate.mjs <package.json>
```

Return the package only when validation reports `valid: true`. Otherwise return
the path-addressed issues without copying source or protected values into the
issue text.
