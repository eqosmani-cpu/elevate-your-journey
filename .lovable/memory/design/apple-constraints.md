---
name: Apple UI constraints
description: Global animation, typography, color, spacing, and state rules for MindPitch
type: design
---

## Animation Rules
- Micro-interactions: 200ms, easing cubic-bezier(0.4, 0, 0.2, 1)
- Page transitions: 350ms, same easing
- Hover: translateY(-1px) + shadow increase ONLY — never scale
- Page enter: opacity 0→1 + translateY(8px→0), children staggered by 40ms
- NO confetti, particles, celebration animations, bounce, or spring

## Typography Rules
- DM Serif Display: page titles, hero titles, large numbers ONLY
- DM Sans 300: body text, descriptions, secondary content
- DM Sans 400: UI labels, nav items, regular text
- DM Sans 500: button text, emphasis, section labels
- NEVER use weight 600, 700, 800, or "bold"

## Color Rules
- #3A5C4A: primary buttons, active states, links, accent borders ONLY
- #B8976A: tier badges, coach ratings, Pro upsell ONLY
- #1A1A1A: primary text ONLY
- NO colored card backgrounds (except daily task hero)
- NO gradient backgrounds on surfaces
- NO shadows darker than rgba(0,0,0,0.10)

## Spacing Rules
- Section gap: 48px
- Card padding: 24–32px
- List item padding: 16–20px vertical
- Touch target minimum: 44×44px (Apple HIG)

## States
- Empty: centered geometric SVG, DM Serif 20px + 14px muted, one CTA
- Error: inline below field, 12px #C0392B, no background, never modal
- Loading: skeleton shimmer on #F0EFEB, match loaded layout exactly, NO spinners
