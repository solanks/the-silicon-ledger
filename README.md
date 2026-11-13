# TechPulse Labs — Google Discover & High-Viewability Astro + Tailwind Tech Site

An Astro (`output: 'hybrid'`) + Tailwind CSS tech publication scaffold engineered for **Google Discover large-card eligibility** and **high IAB Active View ad viewability** with zero Cumulative Layout Shift (`CLS = 0.00`).

## Architecture Overview

1. **Sticky Sidebar Ad Slot & Automatic In-Content Ad Injection (Every 3 Paragraphs)**
   - **Rehype AST Plugin**: [`src/plugins/rehype-inject-ads.mjs`](src/plugins/rehype-inject-ads.mjs) walks the Markdown/MDX HTML AST at compile time and injects a CLS-guarded (`min-h-[250px]`) ad unit immediately after every 3rd top-level `<p>` element (`interval: 3`).
   - **Sticky Sidebar Ad Slot**: [`src/components/AdSlot.astro`](src/components/AdSlot.astro) and [`src/layouts/ArticleLayout.astro`](src/layouts/ArticleLayout.astro) pin a `300×600` half-page ad unit inside a `sticky top-16` rail alongside the article body.
   - **IAB Active View Telemetry**: [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro) includes an `IntersectionObserver` tracking `>= 50%` pixels in view for `>= 1.0s` continuous dwell time.

2. **Quick Verdict / Pros & Cons Component at Top of Every Article**
   - [`src/components/QuickVerdict.astro`](src/components/QuickVerdict.astro) renders automatically above the prose body in [`src/layouts/ArticleLayout.astro`](src/layouts/ArticleLayout.astro), displaying a color-coded 0–10 rating badge, Editor's Award pill, executive summary, retail CTA, and a 2-column Pros/Cons checklist.

3. **NotebookCheck-Style Dynamic Spec Comparison Table**
   - [`src/components/SpecComparisonTable.astro`](src/components/SpecComparisonTable.astro) computes percentage deltas (`+21%`, `-14%`, `100% Base`) against a selectable baseline device, renders proportional benchmark bars, and highlights advantages in **emerald green** and deficits in **rose red** (respecting `higherIsBetter: true | false`). Includes client-side controls to switch the baseline device dynamically or filter to **Only Show Differences**.

4. **Automatic `NewsArticle` JSON-LD Schema & High-Contrast OpenGraph Image Generation**
   - [`src/components/SEOHead.astro`](src/components/SEOHead.astro) emits `<meta name="robots" content="index, follow, max-image-preview:large, ...">` and a complete `NewsArticle` JSON-LD graph (`headline`, 16:9 `image` objects, `datePublished`, `dateModified`, `author`, `publisher`, and `reviewRating`).
   - [`src/pages/og/[slug].png.ts`](src/pages/og/%5Bslug%5D.png.ts), [`src/pages/og/[slug].svg.ts`](src/pages/og/%5Bslug%5D.svg.ts), and [`src/utils/og-template.ts`](src/utils/og-template.ts) generate `1200×630` high-contrast OpenGraph cards with dark gradient overlays, category badges, and the article's verdict score.

5. **MDX Content Collection (`/src/content/articles/*.mdx`)**
   - Validated by Zod in [`src/content/config.ts`](src/content/config.ts) and rendered via [`src/pages/articles/[...slug].astro`](src/pages/articles/%5B...slug%5D.astro).
   - Includes two full-length hardware reviews:
     - [`src/content/articles/snapdragon-8-elite-vs-a18-pro-review.mdx`](src/content/articles/snapdragon-8-elite-vs-a18-pro-review.mdx)
     - [`src/content/articles/rtx-5090-laptop-gpu-benchmarks.mdx`](src/content/articles/rtx-5090-laptop-gpu-benchmarks.mdx)

## Getting Started

```bash
npm install
npm run dev
```
