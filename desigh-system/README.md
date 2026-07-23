# RepoFluent design system

Static HTML documentation for RepoFluent's **Code Command** product language. The
system treats foundations, reusable components, and cross-product patterns as a
versioned interface contract rather than a collection of screenshots.

The current contract version is **0.1.0**. Product consumers import
`assets/tokens.css` and `assets/components.css` directly and expose the active
contract version in their rendered root. Additive tokens, component states, and
documentation corrections are backward-compatible minor or patch changes.
Removing or renaming an `--rf-*` token or `.rf-*` contract, or changing its
documented semantics, requires a major version with migration notes. Deprecated
contracts remain available for at least one minor release before removal.

Open `index.html` directly in a browser. Every page works over `file://`; there is
no build step, package manager, webfont request, or runtime dependency.

No tooling is required to view the documentation. Optional quality checks use the
development dependencies declared in `package.json` and the locally installed Chrome:

```powershell
npm install --no-package-lock
npm test
```

HTML validation uses the included configuration:

```powershell
npm run validate
```

## Contents

| Area        | Coverage                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Foundations | Color, typography, spacing, elevation, iconography, motion, accessibility                                    |
| Components  | Buttons, forms, navigation, commands, tabs, trees, panels, tables, status, overlays, learning/code, charts   |
| Patterns    | Shell, dashboard, lesson workspace, system map, assessments, analytics, curriculum lifecycle, administration |

## Shared assets

- `assets/tokens.css` is the authoritative `--rf-*` token contract.
- `assets/components.css` implements reusable product-facing `.rf-*` classes.
- `assets/docs.css` implements `.ds-*` documentation chrome only.
- `assets/docs.js` supplies documentation navigation, bundled SVG icons, search,
  and progressively enhanced examples.

Product code must not depend on `.ds-*` classes. Documentation examples deliberately
use `.rf-*` classes so changes are reviewed against the same contract consumers use.

## Conventions

- Green means primary action, completion, healthy synchronization, or verified
  provenance. Cyan is reserved for keyboard focus and transient information.
- Amber communicates a condition that needs attention; red communicates failure,
  destructive action, or blocked work. State is never communicated by color alone.
- Technical identifiers, code, paths, revisions, scores, and timestamps use the
  mono family. Explanatory content uses the sans family.
- Product interactions meet WCAG 2.2 AA, work with a keyboard, preserve visible
  focus, and honor `prefers-reduced-motion`.
- Requirement chips refer to the identifiers in `docs/PRD.md`.

## Adding a component

1. Add or extend its semantic tokens in `assets/tokens.css`.
2. Implement a reusable `.rf-*` contract in `assets/components.css`.
3. Document anatomy, variants, states, responsive behavior, accessibility, and
   requirement coverage in the appropriate page.
4. Add the page to the `pages` registry in `assets/docs.js` when introducing a new
   documentation route.
5. Verify mouse, keyboard, narrow viewport, 200% zoom, reduced motion, and non-color
   state communication before treating the contract as active.
