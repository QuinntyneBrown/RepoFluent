# RepoFluent user guide

The end-user documentation for RepoFluent, written for the people who use the
product: learners, authors, reviewers, administrators, and auditors. It starts
from no assumed knowledge and runs through to the advanced governance workflows.

Open `index.html` directly in a browser. Every page works over `file://`; there
is no build step, package manager, webfont request, or runtime dependency.

To serve it locally instead:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000/user-guides/> from the repository root.

## Structure

| Path                                  | Contents                                                         |
| ------------------------------------- | ---------------------------------------------------------------- |
| `index.html`                          | What RepoFluent is, the roles, and reading paths                 |
| `getting-started/`                    | Requirements, opening the app, the workspace, a full walkthrough |
| `learners/`, `authors/`, `reviewers/` | The everyday task for each role                                  |
| `administrators/`                     | Publishing and assigning                                         |
| `reference/`                          | Validation codes, lifecycle, permissions, accessibility          |
| `advanced/`                           | Version comparison, retirement, audit, contract, kit, fixes      |
| `404.html`                            | Branded not-found page                                           |
| `assets/guide.css`, `assets/guide.js` | All documentation chrome                                         |
| `assets/vendor/`                      | Vendored design-system stylesheets — see below                   |
| `staticwebapp.config.json`            | Azure Static Web Apps routing, MIME types, and headers           |

`assets/guide.js` holds the page registry that drives the sidebar navigation,
the breadcrumb trail, the previous/next pager, and the search. Adding a page
means adding an entry there as well as the HTML file; the smoke tests fail if
the two disagree.

## Content rule

This guide documents only behavior that exists. Several controls in the current
release are visible but inert — the command search, the lesson Rendered/Source
toggle, knowledge-check answering, every progress figure — and each is marked
with a **Preview limitation** callout rather than described as working. Keep it
that way: a guide that promises a feature the product does not have is worse
than no guide.

## Branding

The look comes entirely from the `--rf-*` design-system token contract. There
are no literal colors, type stacks, spacing values, radii, shadows, or
durations in `assets/guide.css`, and a smoke test enforces it.

`assets/vendor/tokens.css` and `assets/vendor/components.css` are byte-identical
copies of the files in `desigh-system/assets/`. They are vendored because the
site deploys on its own and cannot reach a sibling directory at runtime. A CI
gate compares them against the originals:

```sh
node eng/verify_user_guide_assets.mjs         # verify; fails on drift
node eng/verify_user_guide_assets.mjs --fix   # re-copy after a design change
```

Run the `--fix` form from the repository root whenever the design system
changes, then review and commit the result.

## Quality gates

Optional locally, required in CI. Install the tooling first — there is
deliberately no lockfile:

```sh
npm install --no-package-lock
npm run format:check
npm run validate
npm test
```

`format:check` is Prettier with its defaults (80 columns, double quotes), which
matches `desigh-system/`. `npm run format:write` applies them. `validate` is
`html-validate` against the same baseline the design-system site uses. `npm test`
is a Playwright suite that loads every page over `file://` and checks the
injected chrome, heading structure, on-page contents, pager order, search,
display preferences, reduced motion, narrow-viewport overflow, token
compliance, and that no internal link or anchor is broken.

The Playwright suite uses the Google Chrome channel rather than a bundled
browser, matching `desigh-system/tests/smoke.spec.js`.

## Deployment

CI runs the gates above in a dedicated `user-guide` job and then deploys this
folder to Azure Static Web Apps from `deploy-user-guide` on a push to `main`,
using `app_location: user-guides` with no build step.

Both jobs are deliberately independent of the `quality` job that builds and
tests the application: a backend, frontend, or dependency-audit failure must
never block documentation, and a broken page must never block the application.

Deployment needs an `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret taken
from an Azure Static Web Apps resource. While that secret is absent the deploy
job emits a warning and skips rather than failing, so the guide is still
validated on every push; adding the secret enables publication with no further
change.

`staticwebapp.config.json` sets a strict content-security policy. The site
makes no external requests of any kind, so the policy needs no exceptions —
which also means **no inline `style` attributes or inline `<script>` blocks**.
Anything you add must live in `assets/guide.css` or `assets/guide.js`.
