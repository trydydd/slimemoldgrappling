---
name: Slime Mold Grappling Club
description: A free, structured library of constrained BJJ games and curricula, run like a field notebook, not a SaaS product.
colors:
  plasmodium-ink: "oklch(0.48 0.14 258)"
  plasmodium-ink-deep: "oklch(0.40 0.13 258)"
  physarum-gold: "oklch(0.72 0.15 82)"
  physarum-gold-deep: "oklch(0.55 0.16 78)"
  lab-white: "oklch(1.000 0.000 0)"
  slide-surface: "oklch(0.96 0.008 258)"
  field-ink: "oklch(0.16 0.02 258)"
  muted-note: "oklch(0.46 0.03 258)"
typography:
  display:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  sm: "2px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.plasmodium-ink}"
    textColor: "{colors.lab-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.plasmodium-ink-deep}"
    textColor: "{colors.lab-white}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.plasmodium-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  tag-label:
    backgroundColor: "{colors.slide-surface}"
    textColor: "{colors.plasmodium-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
---

# Design System: Slime Mold Grappling Club

## 1. Overview

**Creative North Star: "The Slime Mold Method"**

*Physarum polycephalum* — the actual slime mold — solves mazes and optimizes networks with no brain, no hierarchy, no central controller: just distributed rules producing emergent intelligence. That's the design mandate too. No gatekeeping, no credentialed authority look, no single dominant "hero" element commanding the page. The interface should feel like a field log kept by someone running real experiments on the mat: exact, unglamorous, built to be used, not admired.

This system explicitly rejects the generic SaaS/startup look (gradient heroes, rounded cards, bold-CTA funnels — this isn't selling a subscription), the combat-sports bro aesthetic (no skulls, no black-and-red aggression, no macho/predator imagery), and corporate gym-franchise polish. It also rejects the opposite failure mode: precious, cream-toned "editorial calm." Warmth here comes from the amber accent and the plainspoken voice, not from a tinted paper background.

**Key Characteristics:**
- Deep indigo ink on pure white — a lab notebook, not a marketing page
- Physarum gold used sparingly, as a real highlight (a specimen label, a chalk mark), never as decoration
- Flat by default; depth comes from borders and ink weight, never a shadow
- Monospace for labels and identifiers (position names, tags, weights); humanist sans for everything meant to be read at length

## 2. Colors

The palette is a working scientist's toolkit: one confident ink, one warning-label accent, and enough neutral range to keep 116+ games and lesson plans scannable without visual noise.

### Primary
- **Plasmodium Ink** (`oklch(0.48 0.14 258)`): The system's ink. Headings, links, primary buttons, active nav state, icons. Named for the slime mold's vegetative network stage — the thing doing the actual work.
- **Plasmodium Ink Deep** (`oklch(0.40 0.13 258)`): Hover/active state for Plasmodium Ink surfaces and text. Never used as a resting-state color.

### Secondary
- **Physarum Gold** (`oklch(0.72 0.15 82)`): Named for the real, visible color of *Physarum polycephalum* in culture. Used for underlines, highlight marks, borders on tags, and light-fill badges where ink-colored text sits on top. Rare by design — if more than one element per screen uses it, it's lost its meaning as a highlight.
- **Physarum Gold Deep** (`oklch(0.55 0.16 78)`): The filled-badge variant of Physarum Gold, darkened so white text on top clears contrast. Use this, not the lighter Physarum Gold, whenever text sits directly on a solid gold fill.

### Neutral
- **Lab White** (`oklch(1.000 0.000 0)`): Page background. Pure white, zero chroma — deliberately not tinted cream or paper. The "warmth" of this brand lives in the gold accent and the voice, not the background.
- **Slide Surface** (`oklch(0.96 0.008 258)`): Panels, tag backgrounds, code blocks, the sidebar. A hair of Plasmodium Ink's own hue, barely perceptible — never a competing surface color.
- **Field Ink** (`oklch(0.16 0.02 258)`): Body text. ≥7:1 against Lab White.
- **Muted Note** (`oklch(0.46 0.03 258)`): Secondary text, metadata, timestamps, tag counts. ≥3.5:1 against Lab White; never drops below that for anything a user needs to read, only for genuinely optional context.

### Named Rules
**The One Highlight Rule.** Physarum Gold appears on at most one element per viewport. Its rarity is what makes it read as a real signal (new content, a warning, a highlight) instead of decoration.

## 3. Typography

**Display Font:** IBM Plex Mono (with ui-monospace, Menlo fallback)
**Body Font:** Atkinson Hyperlegible (with system-ui fallback)
**Label/Mono Font:** IBM Plex Mono (same as Display)

**Character:** A monospace voice for anything that functions like a label or a logged value — page titles, position names, tags, weights — paired with Atkinson Hyperlegible for anything meant to be read continuously. Atkinson Hyperlegible was designed specifically for legibility at speed and at low vision, which matches the site's WCAG AA commitment directly rather than as an afterthought.

### Hierarchy
- **Display** (600, `clamp(2rem, 5vw, 3.25rem)`, 1.05 line-height): Page-level titles only (home hero, top of a lesson plan). Monospace, so it reads as a stamped header, not a marketing headline. One per page.
- **Headline** (700, `clamp(1.5rem, 3vw, 2rem)`, 1.15): Section headings (h2). Switches to Atkinson Hyperlegible — games and lesson plans nest many of these, and an all-mono page fights readability.
- **Title** (700, 1.125rem, 1.3): Sub-section headings (h3-h4), expand-shortcode titles.
- **Body** (400, 1rem, 1.6): All running prose. Cap at 65-75ch measure.
- **Label** (500, 0.75rem, 1.4, +0.02em tracking): Tags, "Position/Objective/Constraints/Win Condition" field names, nav items, weight/metadata. This is where the monospace "field notebook" identity actually shows up most often, since it recurs on every game.

### Named Rules
**The Logged-Value Rule.** If a piece of text is a label, identifier, or fixed field name (not prose), it's set in Label (mono). If it's meant to be read continuously, it's Atkinson Hyperlegible. Never mix the two within a sentence.

## 4. Elevation

Flat by default, no exceptions. This system does not use drop shadows — depth comes from a 1px border (Slide Surface or Plasmodium Ink at low opacity) and from ink weight (Field Ink vs Muted Note), the way a printed page or an index card conveys structure without floating above the surface.

### Named Rules
**The Printed Page Rule.** Depth comes from ink weight and border, never a shadow. If a component seems to need a drop shadow to read as distinct, restructure it as a bordered block instead.

## 5. Components

### Buttons
- **Shape:** Near-sharp corners (2px radius) — deliberately not the rounded-pill SaaS default.
- **Primary:** Plasmodium Ink background, Lab White text, Label typography, `10px 20px` padding.
- **Hover / Focus:** Background shifts to Plasmodium Ink Deep; focus state adds a 2px Physarum Gold outline (not a glow, not a shadow) for visible keyboard focus.
- **Ghost:** Transparent background, Plasmodium Ink text and 1px Plasmodium Ink border. This is the default for secondary actions — the system prefers ghost buttons over a second filled color, since "bold CTA" stacking is exactly the SaaS reflex being rejected.

### Chips / Tags (game position tags, curriculum tags)
- **Style:** Slide Surface background, Plasmodium Ink text, Label typography, square corners (0px radius), 1px border in Physarum Gold when a tag is the "featured" or newest one — otherwise borderless.
- **State:** No selected/unselected toggle state needed; tags here are descriptive metadata, not filters (yet).

### Cards / Containers
- Used sparingly. This system does not default to a card grid for games or lesson plans — the constraints-led content (Position/Objective/Constraints/Win Condition) already has enough internal structure that wrapping it in another bordered box is redundant. When a container is needed (e.g. a lesson-plan's expand block), use a single 1px Slide-Surface-toned border and Lab White fill; never nest a card inside a card.

### Inputs / Fields (search box)
- **Style:** 1px border in Muted Note, Lab White background, Field Ink text, 2px radius.
- **Focus:** Border shifts to Plasmodium Ink; no glow or shadow, consistent with the Printed Page Rule.

### Navigation (left sidebar, from hugo-theme-relearn)
- **Style:** Slide Surface background for the sidebar, Label typography for menu items, Muted Note for inactive items, Plasmodium Ink for the active section. Hover underlines in Physarum Gold rather than a background-color swap, keeping gold's rarity intact even in a dense list.

### Game Role Block (signature component)
Every game's Top Player / Bottom Player (or Attacking/Defending, Offensive/Defensive) pair is the site's actual signature component — it recurs in all 115+ games. Each role's name is set in Label typography inside a Physarum-Gold-bordered tag; the four fields underneath (Position, Objective, Constraints, Win Condition) use Label typography for the field name and Body typography for its value, so a long scan down the page reads as a consistent, logged data structure rather than loose prose.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page background pure white (`oklch(1.000 0.000 0)`) — let Physarum Gold and the mono labels carry the personality, not a tinted paper bg.
- **Do** set every tag, position label, and metadata field in IBM Plex Mono (Label typography) — this is the recurring "logged observation" texture that makes the system feel like a field notebook rather than a generic docs site.
- **Do** use borders and ink weight for structure; treat a drop shadow as a bug.
- **Do** keep Physarum Gold to one highlight per screen.

### Don't:
- **Don't** use a gradient-hero, rounded-card grid, or bold stacked CTAs — the generic SaaS/startup marketing look this brand explicitly rejects.
- **Don't** use combat-sports-bro visual cliches: no skulls, no black-and-red aggression palettes, no tribal fonts, no macho/predator (lion, apex-predator) imagery.
- **Don't** use corporate gym-franchise polish — no stock-photo hero banners, no "trusted by" logo strips.
- **Don't** tint the background toward cream, sand, or parchment. That reads as the 2026 AI-editorial default, and it undercuts the actual field-notebook identity this system is built on.
- **Don't** add a drop shadow anywhere. Depth is border + ink weight only (see the Printed Page Rule).
- **Don't** nest a card inside a card, or wrap a Game Role Block in an outer card — its own internal structure is the container.
