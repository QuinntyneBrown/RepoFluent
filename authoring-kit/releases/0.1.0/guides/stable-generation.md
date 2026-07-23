# Stable generation

Stable identity and a safe generation manifest make a curriculum package
traceable across regeneration without treating display wording as identity.

## Identity procedure

Build one namespace from:

- organization;
- product;
- approved source-scope identifier; and
- curriculum major version.

For each package, system, course, lesson, objective, code reference, and
assessment, add its entity kind and semantic key. Normalize inputs with Unicode
NFKC, lowercase text, trimmed whitespace, and stable separators. Hash that
canonical tuple with SHA-256 and use the documented kind prefix.

Display titles do not participate in identity. A regeneration over the same
namespace and semantic keys therefore returns the same identifiers. A semantic
fingerprint records what the key represents. If one generated identifier has
different fingerprints in the same run, stop with `AAK_IDENTITY_COLLISION`;
never overwrite either entity.

Run:

```sh
node scripts/generate-identities.mjs <identities.json>
```

## Generation manifest

After evidence and package validation, finalize the run with:

```sh
node scripts/finalize-generation.mjs <completed-run.json> <package.json>
```

The manifest contains:

- tool and model identifiers and versions where available;
- kit and contract versions;
- source-scope identifier and repository revisions;
- generation start and completion timestamps;
- package path and SHA-256;
- identity and evidence input references;
- declared generation options; and
- local validation result.

The finalizer constructs an allow-listed record. Hidden reasoning, credentials,
secrets, passwords, tokens, and full prompt transcripts are not manifest
fields. The command reads local files, runs the bundled validator, and performs
no network operation.
