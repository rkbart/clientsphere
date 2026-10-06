# Design System

ClientSphere's UI follows a premium utilitarian-minimalist language: warm
monochrome surfaces, a single dark accent, editorial typography, and fast,
purposeful motion. This doc is the source of truth for tokens, components,
motion rules, and responsive behavior.

Styling lives in `apps/web/src/app/globals.css`. All values below are the
actual CSS custom properties defined there. `DESIGN.md` (repo root, installed
via `npx getdesign@latest add notion`) is kept as reference for the warm-paper
direction (warm canvas, whisper borders, Notion-style shadow stacks), but the
brand accent stays the original burnt orange — buttons were restored after a
brief blue experiment.

## Design language

- **Warm paper canvas** (Notion-inspired) — warm-white page (`#f6f5f4`),
  white cards/fields for figure/ground, warm grays (never blue-gray),
  and the original burnt-orange accent (`#b64920`)
- **Flat surfaces** — cards rely on whisper borders (`#e6e6e6`); shadows are
  many near-transparent layers (Level 1–3 stacks), appearing mostly on hover
- **Editorial typography** — Inter with tight tracking on headings, uppercase
  micro-labels with `tracking-wider` for table/stat headers; body stays 400,
  700 belongs to headlines
- **No decoration** — no gradients, glassmorphism, emojis, or stock art;
  pill radii belong to CTAs/badges, inputs stay tight

## Tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#f6f5f4` | App background (warm canvas-soft) |
| `--bg-card` | `#ffffff` | Cards, topbar |
| `--bg-elevated` | `#efefed` | Content area, row hover |
| `--bg-sidebar` | `#1c1917` | Sidebar (kept dark — Notion kit is light-only) |
| `--text-primary` | `#191817` | Body text |
| `--text-secondary` | `#615d59` | Secondary text |
| `--text-tertiary` | `#78716c` | Placeholders, metadata (4.6:1 on white) |
| `--border` / `--border-subtle` | `#e6e6e6` / `#f1efe9` | Whisper borders / dividers |
| `--accent` / `--accent-hover` | `#b64920` / `#993a17` | Primary buttons, links, focus |
| `--accent-on-dark` | `#e0653a` | Sidebar/brand accent on dark surfaces |

Status colors (`--success #22c55e`, `--warning #f59e0b`, `--danger #ef4444`,
`--info #3b82f6`) back the badge variants.

### Dark mode (`<html data-theme="dark">`)

Same token names, stone-inverted values (`--bg #0c0a09`, `--bg-card
#1c1917`, `--accent #e0653a`, brightened status colors); badges and
hardcoded red-50 error surfaces get translucent retunes in
`globals.css`. Toggle in the topbar, persisted in `clientsphere-ui`,
OS setting as default. Charts read the tokens via CSS vars.

### Radii, shadows, fonts

- Radius scale: `--radius-sm` 5px → `--radius-xl` 16px (Notion: inputs stay
  tight at 4–5px, pills at 9999px for CTAs/badges)
- Shadows: `--shadow-sm/md/lg` — Notion whisper stacks (4–5 near-transparent
  layers each, none above 0.05 in light mode), hover-only (`--shadow-md` on cards)
- Fonts: `--font-sans`/`--font-display` (single Notion-style sans stack —
  `NotionInter` first, Inter fallback — via `next/font`), `--font-mono`
  (`Berkeley Mono` first, JetBrains Mono fallback)

### Motion

Easing (strong custom curves — built-in CSS easings are too weak):

| Token | Curve | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entering/exiting |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen movement |
| `--ease` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Hover/color changes |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Nav drawer slide |

Durations (UI never exceeds 300ms):

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | Hover/color changes |
| `--duration-press` | 160ms | Button press feedback |
| `--duration-normal` | 200ms | Entrances, feedback |
| `--duration-slow` | 300ms | Staggered group items |

Rules (derived from the animation skills in `.agents/skills/`):

- Transitions name exact properties — never `transition: all`
- Press feedback: `scale(0.97)` at 160ms ease-out, via CSS transition so it
  stays interruptible; applies to any pressable element
- Entrances: `translateY(8px)` or `scale(0.95)` + opacity — never `scale(0)`
- Stagger: 50ms increments (30–80ms band), never blocks interaction
- `ease-in` is never used on UI; keyboard-tier/high-frequency actions get no
  animation
- `prefers-reduced-motion: reduce` — keeps fades at 0.2s, drops all
  movement (entrance transforms, press scale, drawer slide)

## Component classes

Defined in `@layer components` in `globals.css`; use these instead of
one-off utility combinations:

| Class | Variants | Notes |
| --- | --- | --- |
| `.card` | — | White surface, 1px border, hover shadow |
| `.btn` | `.btn-primary`, `.btn-secondary`, `.btn-ghost` | Transitions come from the unlayered interactive block |
| `.input` | — | Focus ring via `box-shadow` |
| `.badge` | `-success`, `-warning`, `-danger`, `-info`, `-neutral` | |
| `.table-row` / `.table-cell` / `.table-header` | — | Row hover = background color only; rows navigate on click (Enter/Space too) except from controls (checkboxes, buttons, links, selects, tag chips) |
| `.animate-fade-in` / `-slide-in` / `-scale-in`, `.stagger` | | Entrance helpers (200ms / 300ms staggered) |

### Dialogs

All three live in `@/components/ui/modal`:

| Component | Use |
| --- | --- |
| `Modal` | Generic dialog; focus-traps on mount, Escape closes, `createPortal` to `body` |
| `ConfirmDialog` | Destructive confirmation (delete), with a `btn-danger` confirm and inline error |
| `ResultModal` | Outcome of a create/save. `tone="success"` uses `CheckCircle2` + `--success-ink` and a primary action; `tone="error"` uses `AlertCircle` + `--danger-ink` and a secondary action |

Create and save flows confirm with `ResultModal` rather than a toast, so
every save in the app reports the same way. Inline `FormError` stays for
validation feedback shown before a save is attempted.

Which one to use:

| Situation | Component |
| --- | --- |
| Submitting a form or saving a record, where the user is waiting on a result | `ResultModal` |
| A settings page the user works in place (lists, toggles, in-row edits) | `ActionBanner` |
| Deleting something irreversible | `ConfirmDialog`, then a banner reporting the outcome |

Destructive actions always confirm with `ConfirmDialog` — never `window.confirm`.
Undo is offered only where the change is genuinely reversible; deletes get the
banner with Dismiss alone.

### Inline banners

`ActionBanner` + `useActionNotice` in `@/components/shared/action-banner`.
Where a dialog would be too heavy — settings pages where the user is working
in place — a single banner reports the last action inline, with **Undo** when
the change is reversible and **Dismiss** always. It is an `aria-live="polite"`
status region. Only one notice shows at a time; a new action replaces the
previous one. Undo clears the banner when it succeeds and swaps in an error
notice if the revert fails.

Used on the Kanban board (drag-drop moves) and the in-place settings pages:
Pipelines, Sequences, Webhooks, API Tokens, Team, Email, Custom Fields, Custom
Objects, Plugins, Automations, plus the Activities bulk-complete bar.

## Responsive behavior

**Breakpoint: `lg` (1024px).** Below it — including a half-width browser
window — the mobile layout applies:

- **Sidebar → drawer.** The fixed 240px rail is `hidden lg:flex`. Below
  `lg` a hamburger in the topbar opens a slide-in drawer with a backdrop,
  Escape-to-close, body scroll lock, and `visibility`-based focus handling
  (closed links leave the tab order only after the exit animation).
  Implemented in `src/components/layout/sidebar.tsx`.
- **Topbar** is sticky and utility-only (mobile hamburger, user, theme,
  logout) — page titles live on the page `<h1>`, not in the header.
- **Page headers** stack (`flex-col` below `sm`), action buttons align
  start.
- **Tables** scroll horizontally (`overflow-x-auto`, `min-w` 560–600px) so
  half-browser views fit without scrolling and phones can pan.
- **Stat/detail grids** stack to one column below `sm`/`md`.
- Content padding: `p-4 sm:p-6`; main content offset `lg:pl-60`.

## Design & animation skills

The repo vendors agent skills used to guide UI work in `.agents/skills/`
(mirrored to `.claude/skills`, locked in `skills-lock.json`):

- **taste-skill** (Leonxlnx) — `minimalist-ui`, `redesign-existing-projects`,
  `design-taste-frontend`, `high-end-visual-design`, `brandkit`
- **emilkowalski/skills** — `animate`, `emil-design-eng`, `apple-design`,
  `review-animations`, `improve-animations`, `animation-vocabulary`

When changing UI, read the relevant skill first; the motion rules above
are distilled from `animate` + `review-animations/STANDARDS.md`.
