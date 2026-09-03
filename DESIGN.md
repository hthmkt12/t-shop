# DESIGN.md - Apple / Nike Luxury Minimalist POD Design System

> Source of Truth for all UI/UX styling rules, design tokens, and components across T-Shop Storefront.
> Derived from `awesome-design-md` fashion minimalism best practices.

---

## 1. Visual Atmosphere & Philosophy
- **Identity:** High-fashion, luxury minimalist Print-On-Demand apparel showroom (inspired by Apple product pages and Nike lab lookbooks).
- **Core Tenets:**
  - *Generous Whitespace:* Let high-resolution POD mockups breathe. Spacing is active, not empty.
  - *Surgical Contrast:* Pure blacks, crisp whites, ultra-subtle 1px boundaries (`rgba(0, 0, 0, 0.08)`).
  - *No AI Slop:* No heavy drop shadows, no rainbow gradient badges, no aggressive border-radius (> 12px except pill tags).
  - *Deliberate Hierarchy:* Bold display headings paired with clean, geometric, high-legibility body type.

---

## 2. Color Roles & Tokens

### Primary Palette (Apple / Nike Monochrome)
| Token Name | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-surface-bg` | `#FFFFFF` | `#0A0A0A` | Full page background |
| `--color-surface-subtle` | `#F5F5F7` | `#141416` | Card background, image mockup backdrop |
| `--color-surface-raised` | `#FFFFFF` | `#1C1C1E` | Dropdowns, modals, floating docks |
| `--color-text-primary` | `#111111` | `#F5F5F7` | Main headings, product titles, prices |
| `--color-text-secondary` | `#6E6E73` | `#86868B` | Subtitles, specifications, descriptions |
| `--color-text-muted` | `#86868B` | `#6E6E73` | Micro-labels, disclaimers, breadcrumbs |
| `--color-border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.12)` | Subtle item dividers, card outlines |
| `--color-border-hover` | `rgba(0,0,0,0.24)` | `rgba(255,255,255,0.30)` | Active/hover borders |
| `--color-cta-primary` | `#000000` | `#FFFFFF` | Primary buy button, active pill selection |
| `--color-cta-on-primary` | `#FFFFFF` | `#000000` | Text on primary CTA |
| `--color-accent-sale` | `#E03E3E` | `#FF453A` | Sale badge, discount callouts |
| `--color-accent-success` | `#10B981` | `#34D399` | Stock status, order confirmation |

---

## 3. Typography Scale & Hierarchy
- **Font Stack:** `'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Display / Hero:** `56px` (Desktop) / `36px` (Mobile) | Line-height: `1.08` | Weight: `700` | Tracking: `-0.025em`
- **Title 1 (H1 / PDP Title):** `36px` / `28px` | Line-height: `1.15` | Weight: `600` | Tracking: `-0.02em`
- **Title 2 (H2 / Section Title):** `24px` / `20px` | Line-height: `1.25` | Weight: `600` | Tracking: `-0.015em`
- **Title 3 (H3 / Card Title):** `18px` / `16px` | Line-height: `1.35` | Weight: `600` | Tracking: `-0.01em`
- **Body Regular:** `15px` / `14px` | Line-height: `1.5` | Weight: `400`
- **Label / Micro:** `12px` | Line-height: `1.4` | Weight: `600` | Text-transform: `uppercase` | Tracking: `0.06em`

---

## 4. Spacing Scale (8pt System)
- `--space-1`: `4px` (hairline spacing, tag padding)
- `--space-2`: `8px` (badge padding, tight gaps)
- `--space-3`: `12px` (input vertical padding)
- `--space-4`: `16px` (standard card padding, grid gap mobile)
- `--space-5`: `24px` (grid gap desktop, section sub-elements)
- `--space-6`: `32px` (card container padding)
- `--space-7`: `48px` (section inner separation)
- `--space-8`: `64px` (section block spacing)
- `--space-9`: `96px` (hero vertical breathing room)

---

## 5. Elevation, Radii & Shadows
- **Border Radius:**
  - `0px` - Brutalist clean (banners, full-width containers)
  - `6px` - Subtle micro (badges, inputs, color swatches)
  - `8px` - Standard Apple rounded (cards, modals, product image frames)
  - `999px` - Full pill (size selector pills, filter tags, primary action pills)
- **Shadows:**
  - *Default:* None (flat borders `1px solid var(--color-border-subtle)`)
  - *Floating Dock / Popover:* `0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)`

---

## 6. Component Styling Specifications

### A. Buttons (`Button`)
- **Primary:** Background `#000000` (Light) / `#FFFFFF` (Dark), text `#FFFFFF` / `#000000`, height `48px`, radius `999px` or `8px`, font-weight `600`.
- **Secondary / Outline:** Background transparent, border `1px solid var(--color-border-hover)`, text `var(--color-text-primary)`.
- **Interaction:** Active scale `0.98`, transition `transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)`.

### B. Product Card (`Card`)
- Image container: Aspect ratio `1:1` or `4:5`, background `var(--color-surface-subtle)`, border `1px solid var(--color-border-subtle)`, radius `8px`.
- Hover: Image smooth scale `1.025` (`transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`).
- Caption: Minimalist typography, no cluttered icons, price shown in bold monochrome.

### C. Header & Navigation
- Height: `60px`, sticky top.
- Background: `rgba(255, 255, 255, 0.8)` (Light) / `rgba(10, 10, 10, 0.8)` (Dark) with `backdrop-filter: blur(20px) saturate(180%)`.
- Bottom border: `1px solid var(--color-border-subtle)`.

### D. POD Customizer
- Toolbar: Floating bottom dock, subtle backdrop blur, pill buttons for Upload / Sticker / View Switch.
- Canvas: Clean dashed boundary `1px dashed rgba(0,0,0,0.15)` for printable area, invisible on export/preview.
- Touch Controls: 44px minimum tap targets, smooth inertia dragging.

---

## 7. Anti-Patterns (Do's & Don'ts)
- **DON'T:** Use harsh, saturated rainbow gradients on headers or cards.
- **DON'T:** Add heavy `box-shadow` or 3D skeuomorphic button effects.
- **DON'T:** Use rounded corners > 10px on rectangular cards (causes "bubble" template look).
- **DON'T:** Hardcode hex colors inside `.module.scss` files. Always reference CSS variables.
- **DO:** Prioritize crisp photography, tight typography tracking on headings, and generous whitespace.

---

## 8. Breakpoints & Grid Strategy
- Mobile: `< 768px` (1-column products, full-bleed hero text)
- Tablet: `768px - 1024px` (2-column products, condensed padding)
- Desktop: `> 1024px` (3-4 column catalog, 2-column split PDP layout)
- Max Container Width: `1360px` with responsive gutters (`16px` mobile, `48px` tablet, `80px` desktop).

---

## 9. AI Agent Prompt Template
When asked to author or refactor any component for T-Shop:
> "Implement this component strictly adhering to DESIGN.md. Use SF Pro/Inter typography scale, 8pt spacing grid, and Apple/Nike monochrome aesthetic. Consume CSS variables from src/app/_css/theme.scss. No gratuitous shadows or saturated gradients."
