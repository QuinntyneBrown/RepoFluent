# Enforce accessible interaction

## Overview

RepoFluent's Experience Platform subsystem provides design-system,
accessibility, responsive, capability, and performance foundations. This
feature provides semantic structure, deterministic focus, and perceivable asynchronous status. It covers *semantic structure and accessible names*, *focus management*, *status, errors, and live announcements*.

The checked-in reference implementation is the static `desigh-system/` site.
Its HTML, CSS, and JavaScript work from `file://` without a runtime dependency.
The production Angular consumer, telemetry integration, supported-browser
matrix, and production measurement profile remain `<TO SUPPLY>`.

## Description

The feature uses the following checked-in assets and planned integration seam.

- **`desigh-system/foundations/accessibility.html`** — keyboard, focus, naming, contrast, and reduced-motion guidance.
- **`desigh-system/components/form-controls.html`** — label, instruction, validation, and error-state contracts.
- **`desigh-system/components/overlays-feedback.html`** — dialog, callout, toast, and focus-restoration examples.
- **`desigh-system/components/toolbars-tabs.html`** — keyboard tab-selection and toolbar interaction examples.
- **`desigh-system/assets/docs.js`** — focus trapping, focus restoration, tab, tree, and announcement behaviors.
- **`ExperiencePlatformAdapter`** — planned Angular library boundary that maps
  the accepted `.rf-*` contracts into product components; implementation remains
  `<TO SUPPLY>` because `frontend/angular.json` contains no application project.
- **`ExperienceConformanceSuite`** — quality boundary composed from Playwright,
  `html-validate`, Prettier, accessibility checks, and production performance
  gates. Production performance and browser-matrix checks remain `<TO SUPPLY>`.

The structural diagram models source artifacts as typed contracts. It does not
claim that the current static JavaScript defines application classes.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-EXP-08` | `L1-EXP-06` | Pages shall use meaningful landmarks/headings, native semantics where possible, unique accessible names, labels/instructions, described errors, table headers, and relationship semantics. Custom widgets shall implement required keyboard patterns and state properties. |
| `L2-EXP-09` | `L1-EXP-06` | Focus order shall follow visual/logical reading order. Dialogs/drawers shall move, contain where modal, and restore focus. Route changes shall announce or focus the new primary heading per pattern. Busy updates shall not steal focus. Sticky UI shall not obscure the focused element. |
| `L2-EXP-10` | `L1-EXP-06` | Async save, validation, grading submission, processing, success, warning, and error states shall use persistent visible status appropriate to severity and programmatic live announcements without excessive repetition. Errors shall identify the affected control/entity and recovery action. |

## Diagrams

### System context

The repofluent user uses RepoFluent through the browser platform. The
design-system reference defines the interaction contract consumed by the
planned Angular application.

![C4 system context for enforce accessible interaction](diagrams/c4-context.png)

### Containers

The static reference site reads the checked-in contract source directly. The
quality tooling validates the same pages and assets before product integration.

![C4 container view for enforce accessible interaction](diagrams/c4-container.png)

### Components

`assets/tokens.css`, `assets/components.css`, the reference pages, and
`assets/docs.js` form the current contract. `tests/smoke.spec.js` exercises the
rendered reference behavior.

![C4 component view for enforce accessible interaction](diagrams/c4-component.png)

### Class structure

The model represents CSS, HTML, JavaScript, and conformance assets as typed
contracts. `ExperiencePlatformAdapter` is the planned production consumer.

![Class diagram for enforce accessible interaction](diagrams/class-structure.png)

### Behaviour — semantic structure and accessible names

The reference assets apply `L2-EXP-08` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for semantic structure and accessible names](diagrams/sequence-l2-exp-08.png)

### Behaviour — focus management

The reference assets apply `L2-EXP-09` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for focus management](diagrams/sequence-l2-exp-09.png)

### Behaviour — status, errors, and live announcements

The reference assets apply `L2-EXP-10` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for status, errors, and live announcements](diagrams/sequence-l2-exp-10.png)
