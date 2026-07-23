# Angular repository analysis profile

Apply this profile only inside the approved source scope and after repository
guidance and secret preflight succeed.

Record evidence for every category:

1. application bootstrap;
2. route boundaries;
3. standalone components or modules;
4. services;
5. dependency injection;
6. state flow;
7. HTTP integration;
8. guards and interceptors;
9. templates;
10. configuration;
11. tests.

Trace a user flow from route entry through component, state, service, and HTTP
boundary. Cite a repository-relative path and stable locator for every step.
Separate supplied source behavior from build-time replacement,
environment-specific configuration, generated clients, and runtime behavior
that the snapshot does not establish.

Do not run the application, install packages, contact an API, or infer a route,
request, guard, interceptor, or state transition absent from supplied source.

Validate the structured report locally:

```sh
node scripts/verify-ecosystem-analysis.mjs \
  angular \
  examples/analysis/angular-analysis.json
```
