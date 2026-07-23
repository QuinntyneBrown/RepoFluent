# Govern browser capabilities

## Overview

RepoFluent's Experience Platform subsystem provides design-system,
accessibility, responsive, capability, and performance foundations. This
feature selects supported browser behavior and records safe capability fallback outcomes. It covers *browser policy and capability monitoring*.

The checked-in reference implementation is the static `desigh-system/` site.
Its HTML, CSS, and JavaScript work from `file://` without a runtime dependency.
The production Angular consumer now applies an Angular 21 Baseline support
policy, exact multi-engine release gates, capability-based fallback, coarse
outcome monitoring, and non-disclosing unsupported-browser guidance.

## Description

The feature uses the following checked-in assets and planned integration seam.

- **`desigh-system/assets/tokens.css`** — current `prefers-reduced-motion` fallback contract.
- **`desigh-system/assets/docs.js`** — progressive enhancement that leaves static content available.
- **`desigh-system/foundations/motion.html`** — motion and reduced-motion reference behavior.
- **`desigh-system/foundations/accessibility.html`** — browser-independent keyboard and semantic guidance.
- **`desigh-system/tests/smoke.spec.js`** — Chrome reference checks without a production support matrix.
- **`approved-browser-support-policy.ts`** — published Angular 21 widely
  available Baseline policy with exact Chromium, Firefox, and WebKit release
  engines plus required and optional capability classes.
- **`BrowserCapabilityAdapter`** — Angular library boundary that checks required
  capabilities without parsing a user-agent, selects safe fallback, reduces
  effects, and emits bounded capability or critical-error outcomes.
- **`PerformanceBudgetPageComponent`** — shared Experience Quality view exposing
  the production browser families, exact CI engines, capability boundary,
  current support state, and monitoring policy.
- **`browser-capability.spec.ts`** — Page Object Model acceptance gate covering
  supported critical flow, no-GPU fallback, unsupported guidance, safe access,
  and coarse telemetry in Chromium, Firefox, and WebKit.
- **`ExperienceConformanceSuite`** — quality boundary composed from Playwright,
  `html-validate`, Prettier, accessibility checks, performance gates, and the
  three-engine browser matrix installed by CI.

The structural diagram models source artifacts as typed contracts. It does not
claim that the current static JavaScript defines application classes.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each row cites
the first L1 identifier named by the source requirement as its primary parent.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-EXP-15` | `L1-EXP-10` | Before launch, the product shall publish supported browser/version/capability profiles and test them in CI/release gates. Production telemetry shall measure capability/fallback use and critical performance/error outcomes without fingerprinting beyond approved need. Unsupported browsers shall receive accurate guidance while preserving safe access where feasible. |

## Diagrams

### System context

The repofluent user uses RepoFluent through the browser platform. The
design-system reference defines the interaction contract consumed by the
planned Angular application.

![C4 system context for govern browser capabilities](diagrams/c4-context.png)

### Containers

The static reference site reads the checked-in contract source directly. The
quality tooling validates the same pages and assets before product integration.

![C4 container view for govern browser capabilities](diagrams/c4-container.png)

### Components

`assets/tokens.css`, `assets/components.css`, the reference pages, and
`assets/docs.js` form the current contract. `tests/smoke.spec.js` exercises the
rendered reference behavior.

![C4 component view for govern browser capabilities](diagrams/c4-component.png)

### Class structure

The model represents CSS, HTML, JavaScript, and conformance assets as typed
contracts. `ExperiencePlatformAdapter` is the planned production consumer.

![Class diagram for govern browser capabilities](diagrams/class-structure.png)

### Behaviour — browser policy and capability monitoring

The reference assets apply `L2-EXP-15` through a semantic contract and an accessible fallback. The conformance suite checks the available reference behavior before the contract is consumed by the production application.

![Sequence diagram for browser policy and capability monitoring](diagrams/sequence-l2-exp-15.png)

### Implementation evidence

Status: **Implemented**

- `angular-21-baseline-2025-10-20` aligns production support to Angular 21's
  widely available Baseline and links its authoritative browser-support source.
- The release gate pins Chromium build line 149.0.7827.x, Firefox 151.0, and
  WebKit 26.5 through Playwright 1.61.1. It runs the browser Page Object in all
  three projects.
- `BrowserCapabilityAdapter` checks required platform functions instead of
  parsing browser identity. WebGPU remains optional and always has an equivalent
  semantic fallback.
- Capability and critical-error outcomes contain only kind, coarse outcome,
  policy identifier, and presentation class. They contain no user-agent,
  platform, language, hardware, user, or tenant values.
- Unsupported profiles receive persistent compatibility guidance, reduced
  effects, static boot guidance, and working curriculum, learning, and semantic
  system navigation.
- Chromium records supported desktop and unsupported narrow visual baselines.
  Firefox and WebKit execute the same critical behavioral acceptance paths.
