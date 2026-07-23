# Local package validation

Run the validator from the acquired release directory. Validation reads only
the named package and bundled validator module.

```sh
node scripts/validate.mjs package.json \
  --contract auto \
  --format json \
  --threshold warning
```

`--contract` accepts `auto` or the bundled `0.1.0` version. `--format` accepts
`json` or `text`. `--threshold` accepts `info`, `warning`, or `error` and hides
lower-severity issues without changing package validity.

JSON results contain `valid`, `outcome`, `contractVersion`, `threshold`, and
ordered `issues`. Every issue contains a stable `code`, `severity`,
`isBlocking`, `path`, and safe `message`.

Exit statuses are deterministic:

| Status | Outcome | Meaning |
| --- | --- | --- |
| `0` | `success` | No issue at or above the threshold |
| `3` | `warnings-only` | Warnings exist without a blocking issue |
| `1` | `validation-failure` | A blocking package issue exists |
| `2` | `invalid-invocation` | Arguments or the package path are invalid |
| `4` | `internal-failure` | The bundled validator cannot initialize or complete |

The one-argument form remains compatible with earlier `0.1.0` callers. It uses
contract auto-detection, JSON output, and the `error` threshold.
