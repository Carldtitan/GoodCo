---
version: 1
register: product
colors:
  background: "oklch(0.985 0.004 220)"
  surface: "oklch(1 0 0)"
  foreground: "oklch(0.22 0.018 230)"
  muted: "oklch(0.45 0.018 230)"
  border: "oklch(0.89 0.012 230)"
  accent: "oklch(0.52 0.12 184)"
  success: "oklch(0.52 0.12 150)"
  warning: "oklch(0.66 0.13 78)"
  danger: "oklch(0.55 0.16 26)"
typography:
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
radii:
  panel: "8px"
---

# Design

## Intent

GoodCo is an operational product. It should feel fast, quiet, and trustworthy for pantry staff working around food, volunteers, and time pressure.

## Visual System

Use a restrained light interface with white work surfaces, neutral separators, compact typography, and one teal action accent. Do not use decorative gradients, large marketing sections, or card grids for their own sake.

## Components

Use standard product controls: top navigation, side navigation on wider screens, tabs where needed, table/list rows, compact forms, icon buttons with labels or accessible names, status chips, and inline validation.

## Copy

Use short labels and direct verbs: Receive, Scan, Save, Review, Export. Empty states should say what is true and offer the next action without long explanations.

## Interaction

Every action needs hover, focus, disabled, loading, and error states. Motion should be short and state-based only.
