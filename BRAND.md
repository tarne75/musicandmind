# Music & Mind: Brand & Style

## Palette

Derived from the original logo (black gears and wordmark, three graduated green quavers) and the original blue navigation links.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0d1210` | Text, headings, topbar, dark sections, footer (near-black with a green cast) |
| `--ink-2` | `#3b4541` | Body text |
| `--ink-3` | `#66716c` | Muted/meta text |
| `--green-700` | `#1f6b45` | Brand ink: eyebrows, active states, link hover |
| `--green-600` | `#2d7a52` | Primary brand green (dark quaver in logo) |
| `--green-500` | `#5fa87f` | Mid green (middle quaver); button gradient top |
| `--green-300` | `#93d3b0` | Light green (third quaver); tints, glows, focus rings |
| `--blue` | `#2c6e9f` | Inline link colour only (from the original nav) |
| `--bg` | `#fbfcfb` | Page background |
| `--surface` | `#ffffff` | Cards, form |
| `--tint` | `color-mix(--green-300 22%, --bg)` | Alternate section background |
| `--line` | `color-mix(--ink 10%, transparent)` | 1px hairline borders |

All tints/borders are derived with `color-mix()`, so changing a token re-themes the site. The greens are estimated by eye from the logo; swap in exact hexes if the client has brand files.

## Logo

- `images/brand/logo-mark.svg`: gear (ink) + quaver (green gradient `#93d3b0 → #2d7a52`). A simplified rework of the original gears-and-notes mark.
- Wordmark is live text: **Music & Mind** in Inter 700, tight tracking (`-0.03em`), with the ampersand in `--green-600`.
- `favicon.svg`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`: white gear + green quaver on a rounded ink tile.
- `images/brand/og.png`: 1200×630 social share card.
- The original logo is downloaded to `images/original/` by the asset script for reference only.

## Typography

- **Inter**, self-hosted (`fonts/inter-latin.woff2`, latin subset, variable 400–700, `display=swap`, preloaded) for everything.
- Fluid scale with `clamp()`: `--step--1` … `--step-4` (hero h1 up to 4.4rem).
- Headings: weight 650–700, letter-spacing `-0.025em` to `-0.035em`, `text-wrap: balance`. Body 400, line-height 1.65.
- Eyebrows: 0.8–0.9rem, uppercase, 600, +0.06em tracking, green-700, with a short green gradient rule.

## Shape, depth and motion

- Radii: 14px (`--r`), 22px (`--r-lg`), pills (999px) for buttons, chips and nav.
- Hairline 1px borders everywhere; soft two-layer shadows (`--shadow-1`, green-tinted `--shadow-2`).
- Primary button: green-500→600 vertical gradient, inset top highlight, soft green shadow. Ghost button: white, hairline border.
- Header: sticky, translucent with `backdrop-filter` blur. Dark topbar holds email, telephone and socials; main bar holds logo, nav and CTA.
- Hero: radial green/blue glows and a masked 56px line grid.
- Motion: 600ms fade/translate reveals (IntersectionObserver), gentle logo float, card lift on hover. Everything is disabled under `prefers-reduced-motion`.

## Voice

Calm, professional, plain English. UK spelling. Clinical claims are limited to what the original site states (accreditations, qualifications, services). No fees are published.

## Imagery

All original images are kept: 26 media clippings (gallery + lightbox) and 10 blog thumbnails. Team photos do not exist on the original site, so the team uses green monogram avatars. Social icons are inline SVG rather than the original raster icons.
