# Design System — Another Summer

## Color strategy
Committed: one saturated forest green carries 30–60% of the surface. Warm cream as background neutrals. Sage as secondary accent.

## Palette
| Token | Value | Use |
|-------|-------|-----|
| `--color-forest` | `#1F4E33` | Primary actions, headlines on light bg, nav active |
| `--color-forest-mid` | `#2D5A3D` | CTAs, links, hover states |
| `--color-cream` | `#F5F1EA` | Page backgrounds |
| `--color-cream-dark` | `#EDE6D3` | Footer band, card backgrounds |
| `--color-sage` | `#A8C5A0` | Accents, email header labels |
| `--color-terracotta` | `#C17A5A` | Sparingly — CTAs or impact highlights only |
| `--color-ink` | `#1F2A20` | Body text, dark headings |
| `--color-muted` | `#4A5247` | Secondary text |
| `--color-border` | `#D9D2C2` | Borders, dividers |
| `--color-footer-bg` | `#1F2A20` | Footer background |

Never use pure `#000` or `#fff`. Tint every neutral toward forest green (chroma 0.005–0.01 in OKLCH).

## Typography
| Role | Font | Variable | Notes |
|------|------|----------|-------|
| Display/Headlines | Fraunces | `--font-fraunces` | Optical size `'opsz' 14`, soft `'soft' 50` |
| Body/UI | Geist | `--font-sans` | Default for all UI text |
| Code/Mono | JetBrains Mono | `--font-mono` | Weight 400–500 |

Body: 16px base, line-height 1.5–1.75, max 65–75ch per line.
Hierarchy: scale + weight contrast ≥1.25 ratio between steps.
No Inter, Roboto, Arial, or system-ui.

## Spacing
4px/8px base grid. Vary spacing for rhythm — identical padding everywhere is monotony.

## Border radius
Max 8px (sharp-radius aesthetic). Prefer 4px for buttons and chips. No pill/bubble shapes.

## Elevation / shadow
Low, directional shadows only. No dramatic drop shadows or glow effects.

## Motion tokens
```css
--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);   /* entering/exiting UI */
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1); /* on-screen movement */
```
Duration: 150ms buttons, 180ms links/hover, 220ms nav drawer, 280ms modals.
Stagger: 40ms between list/grid items.
Never use `ease-in` on UI elements.

## Iconography
SVG only. Nature-inspired: water drops, leaves, lightning, CO2 clouds. Lucide for utility icons (cart, chevron, etc.). Consistent 2px stroke. No emojis.

## Absolute bans
- Gradient text (background-clip: text + gradient)
- Side-stripe borders as card accents (border-left > 1px colored)
- Identical card grids (icon + heading + text repeated)
- Hero-metric template (big number, small label, gradient accent)
- Rounded-bubble UI (border-radius > 8px on cards/containers)
- Purple in any form
- Emojis in any UI context

## Component defaults

**Buttons (primary):**
- Background: `--color-forest-mid` (#2D5A3D)
- Text: white
- Border-radius: 4px
- Padding: `px-4 py-1.5` to `px-6 py-2.5` depending on size
- Active: `scale(0.97)` with 160ms ease-out transition
- Hover: opacity 0.82

**Buttons (secondary/ghost):**
- Background: transparent
- Border: 1px solid `--color-border`
- Text: `--color-muted`
- Hover: background `--color-cream-dark`

**Cards:**
- Background: white or `--color-cream`
- Border: 1px solid `--color-border`
- Border-radius: 6–8px
- No hover lift/shadow — use subtle background shift instead

**Forms:**
- Label visible above every input (no placeholder-only labels)
- Error below the field, not at top
- Input height: 40–44px (touch-friendly)
- Focus ring: 2px solid `--color-forest-mid`, offset 2px
