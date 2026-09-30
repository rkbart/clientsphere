# Design System

ClientSphere's UI follows a premium utilitarian-minimalist language: warm
monochrome surfaces, a single dark accent, editorial typography, and fast,
purposeful motion. This doc is the source of truth for tokens, components,
motion rules, and responsive behavior.

Styling lives in `apps/web/src/app/globals.css`. All values below are the
actual CSS custom properties defined there.

## Design language

- **Warm monochrome** — stone-based neutrals (`#fafaf9` bg, `#1c1917` ink),
  no cold grays, one accent (`#292524`) instead of a brand color
- **Flat surfaces** — cards rely on 1px borders; shadows appear only on hover
- **Editorial typography** — Inter with tight tracking on headings, uppercase
  micro-labels with `tracking-wider` for table/stat headers
- **No decoration** — no gradients, glassmorphism, emojis, or stock art

## Tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#fafaf9` | App background |
| `--bg-card` | `#ffffff` | Cards, topbar |
| `--bg-elevated` | `#f5f5f4` | Content area, row hover |
| `--bg-sidebar` | `#1c1917` | Sidebar |
| `--text-primary` | `#1c1917` | Body text |
| `--text-secondary` | `#78716c` | Secondary text |
| `--text-tertiary` | `#6e6a66` | Placeholders, metadata (5.4:1 on white) |
| `--border` / `--border-subtle` | `#e7e5e4` / `#f5f5f4` | Borders / dividers |
| `--accent` / `--accent-hover` | `#292524` / `#44403c` | Primary buttons, focus |

Status colors (`--success`, `--warning`, `--danger`, `--info`) back the
badge variants.

### Dark mode (`<html data-theme="dark">`)

Same token names, stone-inverted values (`--bg #0c0a09`, `--bg-card
#1c1917`, `--accent #fafaf9`, brightened status colors); badges and
hardcoded red-50 error surfaces get translucent retunes in
`globals.css`. Toggle in the topbar, persisted in `clientsphere-ui`,
OS setting as default. Charts read the tokens via CSS vars.

### Radii, shadows, fonts

- Radius scale: `--radius-sm` 6px → `--radius-xl` 16px
- Shadows: `--shadow-sm/md/lg` — subtle, hover-only (`--shadow-md` on cards)
- Fonts: `--font-sans` (Inter, via `next/font`), `--font-mono`

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
| `.table-row` / `.table-cell` / `.table-header` | — | Row hover = background color only |
| `.animate-fade-in` / `-slide-in` / `-scale-in`, `.stagger` | | Entrance helpers (200ms / 300ms staggered) |

## Responsive behavior

**Breakpoint: `lg` (1024px).** Below it — including a half-width browser
window — the mobile layout applies:

- **Sidebar → drawer.** The fixed 240px rail is `hidden lg:flex`. Below
  `lg` a hamburger in the topbar opens a slide-in drawer with a backdrop,
  Escape-to-close, body scroll lock, and `visibility`-based focus handling
  (closed links leave the tab order only after the exit animation).
  Implemented in `src/components/layout/sidebar.tsx`.
- **Topbar** becomes sticky and shows the current page title on mobile.
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
