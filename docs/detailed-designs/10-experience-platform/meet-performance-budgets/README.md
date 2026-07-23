# Meet performance budgets

## Overview

RepoFluent's Experience Platform subsystem provides design-system,
accessibility, responsive, capability, and performance foundations. This
feature measures learner-shell and interaction budgets under an approved production profile. It covers *learner-shell performance budget*, *interaction and animation budgets*.

The checked-in reference implementation is the static `desigh-system/` site.
Its HTML, CSS, and JavaScript work from `file://` without a runtime dependency.
The production Angular consumer now applies a versioned measurement profile,
repeatable shell and interaction gates, bounded real-user measurement events,
and automatic effect degradation. Supported-browser policy is implemented by
its dedicated detailed-design feature.

## Description

The feature uses the following checked-in assets and planned integration seam.

- **`desigh-system/tests/smoke.spec.js`** — current reference-page load and narrow-viewport smoke coverage.
- **`desigh-system/package.json`** — pinned Playwright, validation, formatting, and test commands.
- **`desigh-system/assets/tokens.css`** — bounded motion durations and reduced-motion replacements.
- **`approved-performance-profile.ts`** — versioned production profile defining
  device, browser, connection, cache, tenant content envelope, milestone, and
  the 2.5 second / 200 ms / 60 fps budgets.
- **`PerformanceBudgetAdapter`** — Angular library boundary that measures shell
  usability and named input-to-visible-response interactions, emits bounded
  non-sensitive RUM events, and degrades effects on reduced-motion preference
  or long main-thread work.
- **`PerformanceBudgetPageComponent`** — design-system-native operator evidence
  view exposing budgets, the approved profile, lab gate, and RUM contract.
- **`performance-budget.spec.ts`** — Page Object Model live-stack acceptance gate
  covering shell usability, navigation, search, drawer, progress, map selection,
  p75 evaluation, privacy-safe event shape, reduced motion, and visual evidence.
- **`ExperienceConformanceSuite`** — quality boundary composed from Playwright,
  `html-validate`, Prettier, accessibility checks, repeatable production-profile
  performance gates, and visual regression. Browser-matrix checks remain owned
  by their dedicated feature.

The structural diagram models source artifacts as typed contracts. It does not
claim that the current static JavaScript defines application classes.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-EXP-12` | `L1-EXP-07` | The production measurement profile shall define device, browser, connection, cache, tenant content envelope, and usability milestone. At p75, the learner shell shall meet 2.5 seconds excluding explicitly governed unusually large optional assets. Measurement shall use real-user monitoring plus repeatable lab gates. |
| `L2-EXP-13` | `L1-EXP-08` | Typical interactions shall meet the p75 200 ms target from user input to visible response under the defined profile. Animations shall target 60 fps, avoid long main-thread tasks, and degrade effects before blocking input or semantic updates. |

## Diagrams

### System context

The platform operator uses RepoFluent through the browser platform. The
design-system reference defines the interaction contract consumed by the
planned Angular application.

![C4 system context for meet performance budgets](diagrams/c4-context.png)

### Containers

The static reference site reads the checked-in contract source directly. The
quality tooling validates the same pages and assets before product integration.

![C4 container view for meet performance budgets](diagrams/c4-container.png)

### Components

`assets/tokens.css`, `assets/components.css`, the reference pages, and
`assets/docs.js` form the current contract. `tests/smoke.spec.js` exercises the
rendered reference behavior.

![C4 component view for meet performance budgets](diagrams/c4-component.png)

### Class structure

The model represents CSS, HTML, JavaScript, and conformance assets as typed
contracts. `ExperiencePlatformAdapter` is the planned production consumer.

![Class diagram for meet performance budgets](diagrams/class-structure.png)

### Behaviour — learner-shell performance budget

The reference assets apply `L2-EXP-12` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for learner-shell performance budget](diagrams/sequence-l2-exp-12.png)

### Behaviour — interaction and animation budgets

The reference assets apply `L2-EXP-13` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for interaction and animation budgets](diagrams/sequence-l2-exp-13.png)

### Implementation evidence

Status: **Implemented**

- `experience-production-v1` checks in device, browser, connection, cache,
  33-block/seven-node content envelope, usability milestone, and budget values
  as one immutable profile consumed by the UI and test gate.
- `PerformanceBudgetAdapter` records the shell only after the routed primary
  heading and navigation exist, and measures named interactions after the next
  visible browser frame.
- The adapter retains a bounded local window and emits
  `repofluent:performance` with only metric name, kind, duration, budget,
  outcome, and profile identifier for deterministic telemetry forwarding.
- Reduced-motion preference takes precedence over automatic long-task
  degradation; both paths reduce effects through the shared motion-token
  contract without delaying semantic updates.
- `performance-budget.spec.ts` starts from a Page Object, evaluates the shell
  and p75 of representative navigation, search, drawer, progress, and
  map-selection samples, and verifies the privacy-safe event shape. It records
  desktop and narrow baselines on Windows and Linux.
