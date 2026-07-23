# Citations and uncertainty

Run source-scope preflight before creating evidence. Evidence is valid only when
every citation resolves to a preflight-approved effective file at the declared
repository revision.

## Citation procedure

For every sourced claim:

1. assign a stable claim identifier;
2. associate one or more stable objective identifiers;
3. classify the claim as `direct-evidence`, `synthesis`, or `interpretation`;
4. record repository identifier, revision, repository-relative path, whole-file
   SHA-256, and a one-based line range for every citation;
5. keep the source statement out of the validation report.

Use `direct-evidence` only when the cited source states the claim. Use
`synthesis` when the claim combines multiple observations. Use
`interpretation` when the claim explains an implication that the source does not
state directly.

## Uncertainty procedure

Every evidence report contains:

- overall confidence;
- assumptions;
- conflicting evidence;
- missing context;
- omissions; and
- unresolved questions.

Each entry has its own confidence, related claim identifiers, citations where
available, and a `material` decision. A material entry also names the package
entity and field where the learner or reviewer can see the uncertainty.
Conflicting evidence retains at least two citations; it is never collapsed into
an unqualified direct-evidence claim.

## Local validation

From the acquired release directory, run:

```sh
node scripts/validate-evidence.mjs <evidence-report.json> <scope.json>
```

The command reruns scope preflight, verifies citation snapshot hashes and line
ranges, checks the structured uncertainty report, and exits with status `1` for
a blocking finding. Output contains safe paths and codes, not source excerpts.
