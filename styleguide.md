# Claude.ai-Inspired Styleguide

> Drop this file into your project (e.g. `/docs/STYLEGUIDE.md` or `.claude/STYLEGUIDE.md`) and reference it in prompts: *"Build this UI following STYLEGUIDE.md exactly."*

---

## 1. Design Philosophy

**Calm, literary, confident.**  Every choice optimizes for:

- **Focus** — one primary action per screen, massive negative space
- **Warmth** — off-black (never pure black), serif display type, a single warm accent
- **Restraint** — no gradients, no shadows, no decorative illustration, no emoji chrome
- **Density you earn** — sidebar is dense because it's utility; canvas is spacious because it's thought

If a component feels "designed," remove a layer.

---

## 2. Color Tokens

Use CSS variables. Dark mode is the default and primary theme.

```css
:root {
  /* Surfaces — warm near-blacks, never #000 */
  --bg-canvas:       #262624;   /* main content area */
  --bg-sidebar:      #1F1E1D;   /* left nav, slightly darker */
  --bg-elevated:     #30302E;   /* input field, cards, hover states */
  --bg-hover:        #2F2E2C;   /* sidebar item hover */

  /* Text */
  --text-primary:    #F5F4EF;   /* off-white, warm */
  --text-secondary:  #A8A49B;   /* metadata, placeholder, inactive nav */
  --text-tertiary:   #6B6860;   /* timestamps, section labels */

  /* Borders — almost invisible, used sparingly */
  --border-subtle:   #3A3936;
  --border-input:    #3F3E3B;

  /* Accent — the single warm coral. Use once per screen. */
  --accent:          #D97757;   /* Claude starburst coral */
  --accent-hover:    #C86543;

  /* Semantic (muted, never saturated) */
  --success:         #7FA87F;
  --warning:         #D4A24C;
  --danger:          #C97064;

  /* Traffic lights (macOS window chrome only) */
  --tl-red:    #FF5F57;
  --tl-yellow: #FEBC2E;
  --tl-green:  #28C840;
}
```

**Rules:**
- One accent color per screen. The coral is a *punctuation mark*, not a theme.
- Never use pure `#000` or `#FFF`. Warm off-tones only.
- Borders are a last resort. Prefer background contrast to separate regions.

---

## 3. Typography

Two families. That's it.

```css
--font-serif: "Copernicus", "Tiempos Text", "Source Serif Pro", Georgia, serif;
--font-sans:  "Styrene B", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono:  "JetBrains Mono", "SF Mono", Menlo, monospace;
```

### Scale

| Token | Size / Line | Family | Use |
|---|---|---|---|
| `display`  | 44px / 52px, weight 400 | serif | Greeting ("Afternoon, Sam"), hero moments |
| `h1`       | 28px / 36px, weight 500 | serif | Page titles |
| `h2`       | 20px / 28px, weight 500 | serif | Section headers inside content |
| `body`     | 15px / 24px, weight 400 | sans  | Default UI + prose |
| `body-sm`  | 13px / 20px, weight 400 | sans  | Sidebar items, metadata |
| `label`    | 12px / 16px, weight 500, tracking 0.04em, uppercase | sans | Section labels ("Recents") |
| `mono`     | 13px / 20px | mono | Code, keyboard shortcuts (⌘K) |

**Rules:**
- Serif for anything the user *reads as content* (greetings, headings, long-form).
- Sans for anything the user *operates* (buttons, nav, forms).
- Never mix weights heavier than 500. No bold. Weight does the emphasis work, not size jumps.

---

## 4. Spacing & Layout

8px base grid. Memorize these:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-8: 48px;
--space-10: 64px;
--space-12: 96px;
```

### Layout primitives

- **Sidebar:** fixed 260px width, full height, `--bg-sidebar`
- **Canvas:** fluid, centered content column max-width **720px** for input/prose, **960px** for dashboards
- **Vertical rhythm:** hero content sits at roughly 35% viewport height, never dead-center — slightly high feels intentional
- **Padding:** sidebar items use `12px 16px`; canvas uses `32px` minimum gutter

---

## 5. Components

### 5.1 Sidebar nav item

```
[icon 16px]  [label 13px]                    [shortcut / badge]
padding: 8px 12px
radius: 8px
hover: bg = --bg-hover
active: bg = --bg-elevated, text = --text-primary
inactive text: --text-secondary
```

Icons are stroke-based, 1.5px stroke, 16×16, monochrome. Lucide icon set is the closest off-the-shelf match.

### 5.2 Primary input (the "How can I help you today?" field)

```css
background: var(--bg-elevated);
border: 1px solid var(--border-input);
border-radius: 16px;
padding: 20px 24px;
min-height: 96px;
font: var(--body);
placeholder-color: var(--text-secondary);

/* Focus */
border-color: var(--accent);
box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.15);
```

Bottom row inside input: left-aligned `+` attach button, right-aligned model selector + mic icon. Icons are 20px, `--text-secondary`, hover → `--text-primary`.

### 5.3 Action chip buttons (Write / Learn / Code / From Drive / From Gmail)

```css
background: transparent;
border: 1px solid var(--border-subtle);
border-radius: 10px;
padding: 8px 14px;
font: 13px / 1 sans, weight 500;
color: var(--text-primary);
gap: 6px;              /* icon to label */
hover: bg = --bg-elevated;
```

Brand icons (Drive, Gmail) keep their color. Generic icons (Write, Learn, Code) are `--text-secondary`.

### 5.4 Section labels

```
"Recents"
text-transform: uppercase
font: 11px, weight 500, letter-spacing: 0.06em
color: var(--text-tertiary)
margin: 16px 12px 8px
```

### 5.5 User identity block (bottom-left)

```
[avatar 32px, radius 50%]  Full Name (13px, primary)
                           Plan name (12px, tertiary)
```

---

## 6. Iconography

- **Stroke-based, 1.5px, 16–20px**
- Lucide or Phosphor (regular weight) — never Font Awesome, never filled/duotone
- The Claude starburst (8-point asterisk/sparkle) is the ONLY branded mark. Use at 20–28px, always in `--accent`.

---

## 7. Motion

Keep it almost invisible.

```css
--ease: cubic-bezier(0.2, 0, 0, 1);
--dur-fast: 120ms;
--dur-base: 200ms;
```

- Hover transitions: `background 120ms var(--ease)` only
- No bounce, no spring, no scale-on-hover
- Modals fade + 4px rise, 200ms
- Never animate color on accent elements (feels cheap)

---

## 8. Do / Don't

**DO**
- Leave enormous negative space around the primary action
- Use the serif for the one emotional moment per screen (greeting, empty state, success)
- Let the sidebar be dense and utilitarian — contrast with the canvas is the whole point
- Make the accent coral rare and deliberate

**DON'T**
- No drop shadows beyond `0 1px 2px rgba(0,0,0,0.2)` on floating menus
- No gradients, ever
- No illustrations, stock imagery, or emoji as UI
- No more than 2 font weights on a screen
- No accent color on more than one element per viewport
- No rounded corners above 16px (feels toy-like) or below 6px (feels sterile)

---

## 9. Quick implementation (Tailwind config snippet)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      canvas:   '#262624',
      sidebar:  '#1F1E1D',
      elevated: '#30302E',
      ink:      { DEFAULT: '#F5F4EF', muted: '#A8A49B', dim: '#6B6860' },
      accent:   { DEFAULT: '#D97757', hover: '#C86543' },
    },
    fontFamily: {
      serif: ['Copernicus', 'Tiempos Text', 'Georgia', 'serif'],
      sans:  ['Styrene B', 'Inter', 'system-ui', 'sans-serif'],
    },
    borderRadius: { xl: '16px', lg: '10px', md: '8px' },
  }
}
```

---

## 10. Prompt for Claude Code

> Paste at the top of any build prompt:

"Follow `STYLEGUIDE.md` exactly. Dark theme only. Warm off-black surfaces (`#262624` canvas, `#1F1E1D` sidebar), serif display type for headings and greetings, sans for UI. Single coral accent (`#D97757`) used at most once per viewport. No gradients, no shadows beyond subtle, no illustrations. Massive negative space around the primary action. If in doubt, remove a layer."