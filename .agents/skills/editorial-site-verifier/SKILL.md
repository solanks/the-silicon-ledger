---
name: editorial-site-verifier
description: >-
  Verifies published articles, replaces AI-looking SVG diagrams/circles with real
  editorial photography, validates all formatting and links, and audits the
  website layout for The Silicon Ledger.
---

# Editorial Site Verifier Agent

Use this skill when asked to verify published articles, source real images to replace AI-looking diagrams/SVGs, check formatting and links, or audit the website layout.

## Workflow

### 1. Audit Published Content & Schema
- Run `python3 scripts/verify_and_polish_site.py --audit` to scan `src/content/articles/*.mdx`, `src/content/config.ts`, `src/layouts/*.astro`, and `src/pages/*.ts`.
- Check every article in `src/content/articles/` for:
  - Valid YAML frontmatter matching `src/content/config.ts` (`title`, `pubDate`, `category`, `tags`, `heroImage`, `verdict`, `poll`).
  - No unintended `draft: true` on articles linked from the main navigation or homepage.
  - Complete Markdown/MDX formatting (no unclosed tags, broken tables, or raw HTML artifacts).

### 2. Replace AI Diagrams & Circles with Real Photography
- Never leave `.svg` diagram/circle graphics as article `heroImage.src` when a real photograph belongs there.
- Remove `"Red Circle: ..."` or `"Diagram ..."` strings from `heroImage.focalCallout`, `heroImage.alt`, and `heroImage.caption`.
- For each article needing a real photo:
  1. Search Wikimedia Commons (or another free-to-use editorial source) for a high-resolution **landscape** photograph (`width >= 1200px`) matching the article's hardware/topic.
  2. Download it locally to `public/images/articles/<slug>.jpg` (e.g., via `https://commons.wikimedia.org/wiki/Special:FilePath/<Filename>?width=1600`).
  3. Verify with `file public/images/articles/<slug>.jpg` that it is a valid JPEG/PNG/WebP and landscape (`width >= 1200`, `width > height`).
  4. Update the article's `heroImage.src`, `alt`, and `caption`, and remove `focalCallout` if it describes a diagram/circle.

### 3. Verify Formatting & Links
- Eliminate all placeholder domains (`example.com`, `techpulse.example.com`) in `src/content/`, `src/pages/`, and `src/layouts/`.
- Verify every local asset path (`/images/...`) exists under `public/`.
- Verify every internal route (`/articles/...`, `/about`, `/privacy`, `/contact`, `/rss.xml`, `/news-sitemap.xml`) resolves to a valid Astro page or endpoint.
- Check `src/pages/rss.xml.ts` so `<enclosure type="...">` matches the actual image extension (`image/jpeg` for `.jpg`, not hardcoded `image/svg+xml`).

### 4. Audit Website Layout & Build
- Inspect `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`, and `src/pages/index.astro`:
  - Ensure navigation is accessible on both mobile (`md:hidden`) and desktop (`md:flex`).
  - Remove any developer/debug badges or internal schema/OG preview widgets exposed to readers.
  - Ensure hero images use `aspect-video` + `object-cover` so real photos crop cleanly without distortion.
- Run `npm run build` (when Node/npm is available) and `python3 scripts/verify_and_polish_site.py --audit` to confirm zero errors.
