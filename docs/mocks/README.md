# RepoFluent UI Concept Mocks

Three distinct design directions for RepoFluent, based on [docs/PRD.md](../PRD.md).
Each concept is fully self-contained (HTML/CSS, minimal JS, no build step, no external
dependencies) and contains the same three screens with the same fictional sample data —
the "Orion Commerce Platform" (a C#/Angular enterprise codebase) — so the concepts can
be compared fairly.

## Screens per concept

| Page | Purpose | Key PRD requirements demonstrated |
| --- | --- | --- |
| `index.html` | Learner dashboard | LRN-01, LRN-08, ANL-01 |
| `lesson.html` | Lesson + code tour (split view) | LRN-02/05/06, CODE-01/02/03/04 |
| `analytics.html` | Manager analytics | ANL-02/03/04/05 |

## The concepts

### Concept 1 — Codeframe (`concept-1-codeframe/`)
IDE-native, dark theme. Learning lives beside the code: split-pane lesson/code layout,
file-tree navigation, monospace accents, syntax-highlighted excerpts, status-bar-style
progress. Optimized for engineers who want RepoFluent to feel like an extension of
their editor.

### Concept 2 — Clarity (`concept-2-clarity/`)
Modern enterprise SaaS, light theme. Card-based layout, generous whitespace, soft
elevation, progress rings, and mastery chips. Familiar and approachable across all
personas, with strong visual hierarchy and an accessibility-first tone.

### Concept 3 — Atlas (`concept-3-atlas/`)
Map-first, spatial depth. Navigation is organized around the system/subsystem map,
with ambient gradient depth and glass panels that hint at the PRD's progressive
WebGPU vision (while remaining pure CSS). Lessons and analytics are framed as
overlays on the architecture map.

## Viewing

Open any `index.html` directly in a browser — no server or build required.
Each page links to the other pages within its concept.
