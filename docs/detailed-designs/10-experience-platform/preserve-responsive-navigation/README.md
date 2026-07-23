# Preserve responsive navigation

## Overview

RepoFluent's Experience Platform subsystem provides design-system,
accessibility, responsive, capability, and performance foundations. This
feature preserves route, focus, and domain context across responsive layouts and large content. It covers _context-preserving navigation primitives_, _responsive layout profiles_, _large-content rendering_.

The checked-in reference implementation is the static `desigh-system/` site.
Its HTML, CSS, and JavaScript work from `file://` without a runtime dependency.
The production Angular consumer now applies the same split-pane, drawer,
history, focus-return, reflow, and progressive-content contracts. Telemetry,
supported-browser policy, and production measurement are implemented by their
dedicated detailed-design features.

## Description

The feature uses the following checked-in assets and planned integration seam.

- **`desigh-system/patterns/application-shell.html`** — wide, compact, and phone shell composition reference.
- **`desigh-system/components/navigation.html`** — breadcrumbs and application navigation contracts.
- **`desigh-system/components/tree.html`** — keyboard-operable hierarchical navigation reference.
- **`desigh-system/assets/components.css`** — responsive `.rf-*` layout and scrolling contracts.
- **`desigh-system/tests/smoke.spec.js`** — 390 px viewport overflow and page-load checks.
- **`ExperiencePlatformAdapter`** — Angular library boundary that records
  contextual UI in browser history and exposes deterministic Back/close
  behavior while product components consume the accepted `.rf-*` contracts.
- **`ExperienceConformanceSuite`** — quality boundary composed from Playwright,
  `html-validate`, Prettier, accessibility checks, responsive visual regression,
  and production performance gates. Production performance and browser-matrix
  checks remain owned by their dedicated experience-platform features.

The structural diagram models source artifacts as typed contracts. It does not
claim that the current static JavaScript defines application classes.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-EXP-06` | `L1-EXP-04` | The platform shall provide route, breadcrumb, tab, drawer, split-pane, focus-return, and back-navigation patterns that retain domain context in URL/state where safe. Opening contextual code, glossary, or map detail shall not discard unsaved/progress state. |
| `L2-EXP-07` | `L1-EXP-05` | Supported profiles shall define minimum viewport, zoom, pointer, and orientation expectations for desktop, tablet, and narrow use. Navigation, assessment, lesson, import/review, administration, and analytics shall reflow without two-dimensional page scrolling, clipped controls, or inaccessible offscreen actions except intentional code/table regions with their own scrolling. |
| `L2-EXP-14` | `L1-EXP-09` | Long lessons, file trees, tables, result lists, and analytics datasets shall use an appropriate paging/virtualization/progressive strategy that preserves semantic order, focus, screen-reader access, find/filter behavior, and stable scroll position. |

## Diagrams

### System context

The repofluent user uses RepoFluent through the browser platform. The
design-system reference defines the interaction contract consumed by the
planned Angular application.

![C4 system context for preserve responsive navigation](diagrams/c4-context.png)

### Containers

The static reference site reads the checked-in contract source directly. The
quality tooling validates the same pages and assets before product integration.

![C4 container view for preserve responsive navigation](diagrams/c4-container.png)

### Components

`assets/tokens.css`, `assets/components.css`, the reference pages, and
`assets/docs.js` form the current contract. `tests/smoke.spec.js` exercises the
rendered reference behavior.

![C4 component view for preserve responsive navigation](diagrams/c4-component.png)

### Class structure

The model represents CSS, HTML, JavaScript, and conformance assets as typed
contracts. `ExperiencePlatformAdapter` is the planned production consumer.

![Class diagram for preserve responsive navigation](diagrams/class-structure.png)

### Behaviour — context-preserving navigation primitives

The reference assets apply `L2-EXP-06` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for context-preserving navigation primitives](diagrams/sequence-l2-exp-06.png)

### Behaviour — responsive layout profiles

The reference assets apply `L2-EXP-07` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for responsive layout profiles](diagrams/sequence-l2-exp-07.png)

### Behaviour — large-content rendering

The reference assets apply `L2-EXP-14` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for large-content rendering](diagrams/sequence-l2-exp-14.png)

### Implementation evidence

Status: **Implemented**

- Source context is represented by the `source` URL parameter and a browser
  history entry. Browser Back or the close control removes the context and
  restores focus to the invoking source reference.
- The lesson workspace uses a desktop split pane and a token-based narrow
  drawer. Acceptance coverage verifies 390 px narrow and 640 px high-zoom
  equivalent profiles without page-level horizontal overflow.
- Supported layout profiles are desktop at 64 rem and above, compact from
  48–64 rem, and narrow from 20–48 rem in portrait or landscape; keyboard and
  pointer controls remain available in each profile.
- Lessons render ten semantic blocks at a time. Each expansion announces the
  new count and focuses the first revealed block so reading position remains
  predictable without rendering the full pilot-limit fixture.
- `responsive-navigation.spec.ts` starts from a Page Object, exercises a
  deterministic 33-block assigned lesson, and records desktop and narrow visual
  baselines on Windows and Linux.
