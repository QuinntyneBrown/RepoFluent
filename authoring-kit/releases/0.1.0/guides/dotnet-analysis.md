# C# repository analysis profile

Apply this profile only inside the approved source scope and after repository
guidance and secret preflight succeed.

Record evidence for every category:

1. solution and project structure;
2. application boundaries;
3. dependency injection and composition;
4. controllers or endpoints;
5. domain services;
6. persistence;
7. messaging;
8. configuration;
9. background workers;
10. external clients;
11. tests.

For each finding, cite a repository-relative path and a stable symbol, line
range, or configuration key. Describe only behavior supported by supplied
source. Record reflection, assembly scanning, environment-dependent wiring,
generated code, runtime plug-ins, and other dynamic behavior as unresolved
when the supplied snapshot does not determine the result.

Do not execute projects, restore packages, run migrations, contact services, or
infer runtime registrations from naming conventions. Use tests as corroborating
evidence, not as proof of production configuration.

Validate the structured report locally:

```sh
node scripts/verify-ecosystem-analysis.mjs \
  dotnet \
  examples/analysis/dotnet-analysis.json
```
