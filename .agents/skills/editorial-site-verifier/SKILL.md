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

### 2. Rotate Image Designs & Evaluate Visual Similarity
- Never use the same dark/neon AI template across articles. Rotate through distinct styles: bright daylight product photography, candid lab/workbench documentary photos, clean macro hardware shots, cool-toned infrastructure photos, and real photos with editorial overlays.
- After posting or updating any image, **run the separate image-diversity test**:
  `python3 scripts/verify_and_polish_site.py --check-image-diversity`
- If any two images are flagged as visually or structurally similar (or if >50% of images are dark/low-key), **redo the offending image** using a contrasting visual style, lighting, or editorial overlay until `--check-image-diversity` passes.

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
