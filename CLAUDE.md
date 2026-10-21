# CLAUDE.md: Music & Mind (musicandmind.co.uk)

Static, dependency-free rebuild of the old Wix site, for hosting on GitHub Pages. Palette, logo and type details are in `BRAND.md`.

## Stack and constraints

- Static HTML, **one** stylesheet (`css/style.css`, about 22 KB / 6 KB gzipped), **one** script (`js/main.js`, about 16 KB / 6 KB gzipped), and **self-hosted, preloaded Inter** (`fonts/inter-latin.woff2`: latin subset, variable 400-700, 17 KB; same approach as t4-digital.uk). No Google Fonts requests, no frameworks, no build step, no npm packages.
- Platform features used: `<dialog>` lightbox (native focus trap and Esc), IntersectionObserver (reveals and scrollspy), CSS custom properties, `clamp()` fluid type, `color-mix()`, `svh` units, `:user-invalid`, `backdrop-filter`.
- Paths are relative, so the site works from a domain root or a project sub-path. `.nojekyll` is included.

## Pages

| File | Purpose / anchors |
|---|---|
| `index.html` | Hero; `#approach`, `#services` (6 cards from JS), `#team`, `#clients`, `#media`, `#start` |
| `about.html` | `#story`, `#team`, `#adam-ficek`, `#claire-bloxsom`, `#mike-akroyd`, `#approach` |
| `services.html` | `#overview`, `#services` (all 9 from JS; each card has an id such as `#burnout`), `#how`, `#clients` |
| `media.html` | `#video` (click-to-load YouTube in the dialog), `#press` (filterable list), `#gallery` (26 clippings, lightbox) |
| `blog.html` | 10 post cards with excerpts, linking to the original Wix posts |
| `contact.html` | Formspree form, info cards, FAQ. Accepts `?topic=<slug>` to preselect the support area |
| `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest` | Housekeeping |

Navigation: header links go to pages (t4-digital style). Every page except blog/contact also has a sticky in-page sub-nav of `#anchors`, and `main.js` scrollspy highlights the current section. The header (topbar with email, tel and socials, plus logo and nav) is `position: sticky`, so it is always visible. `--header-h` is measured in JS and drives `scroll-padding-top`.

## Services data (Google Sheets-ready)

Services are rendered by `js/main.js` from a CSV string (`SERVICES_CSV`) in the same shape a published Google Sheet produces. Columns: `order, slug, title, icon, summary, points, cta_label, cta_href, active`. `points` is `|`-separated. Fees were deliberately left out.

**Phase 2:** publish the sheet (File > Share > Publish to web > CSV) and paste the URL into `SERVICES_SHEET_URL` at the top of `main.js`. The loader caches in `sessionStorage` for 10 minutes and falls back to the embedded CSV on any failure or timeout. Icon names available: `mic, battery, sparkle, lifebuoy, star, users, heart, pin, deck`.

Caveat: you asked me to mirror the libraries used by karatekidshemel.co.uk and pottersbargarage.co.uk. I could not see their page source (only rendered text), and you also asked for zero dependencies, so I wrote a small RFC-4180 CSV parser inside `main.js` instead of adding PapaParse. If you want PapaParse for parity, swap `parseCSV()` for `Papa.parse(text,{header:true})`.

## Contact form

Posts to `https://formspree.io/f/xwvndkow`. It works without JS (normal POST), and with JS it submits via `fetch` and shows an inline status message. A honeypot field (`_gotcha`) and an enquiries-only consent checkbox are included. The first live submission may require confirming the Formspree form.

## TODO before launch

1. **Replace the placeholder email and phone.** The original site publishes neither, so I used `hello@musicandmind.co.uk` and `+44 0000 000000` in the header, footer and contact page. From the project root:
   `grep -rl "hello@musicandmind.co.uk" --include=*.html . | xargs sed -i '' 's/hello@musicandmind.co.uk/REAL_EMAIL/g'` (drop the `''` on Linux), and the same for `+44 0000 000000` and `+440000000000`.
2. (Done) Images are downloaded and converted to WebP.
3. Add a `CNAME` file if using a custom domain; check the `canonical` and `sitemap.xml` URLs (they assume `https://www.musicandmind.co.uk`).
4. Blog posts still link to the old Wix post URLs, which will break once the domain moves. Run `node scripts/download-assets.mjs --blog` and migrate the text (Phase 2).

## Images

The site serves optimised **WebP** copies (`images/media/m01…m26.webp`, `images/blog/b01…b10.webp`: max 1200px / 960px wide, quality 82, 28 MB down to 1.7 MB). Real width/height attributes are set on every `<img>` to prevent layout shift, and everything below the fold is `loading="lazy"`.

The full-resolution originals from the old Wix site are kept as local backups in `images/originals/` (git-ignored, not published). To (re)download them run `bash scripts/download-images.sh` (needs only `curl`; skips existing files). To regenerate a WebP from an original, resize and convert it with any tool, e.g. `cwebp -q 82 -resize 1200 0 in.png -o images/media/m04.webp` (`brew install webp`).

`scripts/download-assets.mjs` is an optional Node alternative that can also scan for extra images and export blog post text (`--blog`).

Notes: the media clippings are screenshots and will look soft (the Phase 2 quality pass). They have generic alt text ("Media clipping N") that should be improved. I could not reliably map each clipping to an article, so the clippings gallery and the press link list are separate. Width/height attributes come from the original display sizes to avoid layout shift.

## What changed from the original

- Content kept: all sections and copy themes (about/team and credentials, nine services, previous clients, media, blog, contact).
- Reshuffled/bulked: home now has what-we-do, services, team, clients, media and getting-started sections; each service gained a short "how we can help" list; added an About "approach" section, services "how it works", a contact FAQ and a crisis-support note. Check the added copy for clinical accuracy before launch.
- Team monograms stand in for photos (the original site has none).
- No fees, per the brief.

## Local preview

`python3 -m http.server 8000` in the project root, then open http://localhost:8000.

## Git

Commit after every completed change (don't wait to be asked). Commit as the repository owner only. Do **not** add `Co-Authored-By` trailers or any Claude/AI attribution lines to commit messages or PR descriptions.
