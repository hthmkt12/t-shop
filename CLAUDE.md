# T-Shop — Agent Context

## Project

**Name**: T-Shop (Tech-Shop)  
**Type**: Full-stack e-commerce + Print-on-Demand (POD) storefront  
**Stack**: Next.js 13.5 (App Router) · Payload CMS 2.0 · MongoDB · Stripe · Fabric.js · AWS S3 · TypeScript  
**PM**: yarn  
**Branch convention**: feature branches → `main` (fork remote: `hthmkt12/t-shop`)

## Key Features

- Interactive canvas POD customizer (Fabric.js)
- Product catalog, category filtering, search
- Cart, order bumps, checkout (Stripe)
- Order tracking, purchase history
- User auth + profile management
- Dynamic page block builder (Payload CMS)

## Business Context

| Field | Value |
|-------|-------|
| Market | International (quốc tế) |
| Segment | POD — multi-product (apparel, accessories, prints, etc.) |
| Pricing | Multi-tier |
| Target audience | Gen Z + Millennials (18–35) |
| USP | Powerful in-browser customizer — customers design their own products |
| Competitors | Printful, Printify, Redbubble, Merch by Amazon |
| Marketing goals | Sales conversion · Brand awareness · Lead generation · Customer retention |
| Social presence | None yet |
| Website | Not deployed (localhost/dev only) |
| Marketing budget | TBD |

## Brand Assets

| Asset | Path |
|-------|------|
| Logo (black) | `public/logo-black.svg` |
| Logo (white) | `public/logo-white.svg` |
| Favicon | `public/favicon.ico` |
| Hero images | `public/admin ui/hero/hero-1.png`, `hero-2.png` |
| UI icons | `public/assets/icons/` |
| Illustrations | `public/assets/images/image-1.svg` … `image-4.svg` |

## Design Guidelines

See `plans/reports/advise-260903-1912-apple-nike-ui-ux-design-md.md` — Apple/Nike minimalist system: neutral palette, strong typography scale, generous whitespace.  
See `plans/260903-1912-apple-nike-ui-ux-design-md/` for design token phases.

## Plans & Reports

| Path | Topic |
|------|-------|
| `plans/260905-0442-pod-customizer-upgrade/` | POD customizer upgrade plan |
| `plans/reports/xia-260905-1130-vistaprint-ux-analysis.md` | POD UX benchmark (Vistaprint) |
| `plans/reports/advise-260903-1912-apple-nike-ui-ux-design-md.md` | UI/UX design system |

## Directory Guide

```
src/app/
  (pages)/          # Route pages (products, cart, checkout, account…)
  _components/      # Shared UI components (PodCustomizer, etc.)
  _blocks/          # Payload dynamic blocks
public/             # Static assets (logos, hero, icons)
plans/              # Implementation plans & reports
docs/               # Project documentation (created as needed)
```

## Rules for Agents

- Read `~/.claude/rules/development-rules.md` before any code change.
- Plans → `plans/` · Reports → `plans/reports/` · Docs → `docs/` (max 800 LOC per file).
- Report naming: `plans/reports/{type}-{YYMMDD}-{HHMM}-{slug}.md`
- Plan dir naming: `plans/{YYMMDD}-{HHMM}-{slug}/`
- Do NOT create markdown outside `plans/` or `docs/` unless user explicitly requests it.
- KISS + DRY. No unrequested scope.
- Conventional commits, no AI references in commit messages.
