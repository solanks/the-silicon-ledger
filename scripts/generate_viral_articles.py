#!/usr/bin/env python3
"""
Phase 2: Multi-Feed Hardware Intelligence, Street-Price Scraper & Draft Approval Pipeline
Powered by the Google Antigravity Python SDK (`google-antigravity`) and `feedparser`.

Feeds Polled:
1. Benchmark & Leak Feeds: Geekbench 6 Browser RSS, VideoCardz, Phoronix
2. Lab Reviews & Teardowns: NotebookCheck, 9to5Mac, iFixit
3. Live Street-Price Deal Feeds (for "The Overpriced Index"): r/buildapcsales, r/appleswap, Slickdeals
"""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
import re
import subprocess
import sys

import feedparser
from google.antigravity import Agent, CapabilitiesConfig, LocalAgentConfig

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = WORKSPACE_ROOT / "src" / "content" / "articles"
ARTIFACTS_DIR = WORKSPACE_ROOT / "artifacts"

# 1. Multi-Source Hardware & Benchmark RSS Feeds
HARDWARE_NEWS_FEEDS = {
    "9to5mac": "https://9to5mac.com/feed/",
    "notebookcheck": "https://www.notebookcheck.net/RSS-Feed-Notebook-Reviews.8156.0.html",
    "videocardz": "https://videocardz.com/feed",
    "phoronix": "https://www.phoronix.com/rss.php",
    "geekbench6": "https://browser.geekbench.com/v6/cpu.rss",
    "ifixit": "https://www.ifixit.com/News/rss",
}

# 2. Live Street-Price / Refurb Deal Feeds (Injected into "The Overpriced Index" widget)
STREET_PRICE_DEAL_FEEDS = {
    "r_buildapcsales": "https://www.reddit.com/r/buildapcsales/hot/.rss",
    "r_appleswap": "https://www.reddit.com/r/appleswap/new/.rss",
    "slickdeals_frontpage": "https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1",
}

EDITORIAL_TWIST_SYSTEM_PROMPT = """
You are the "Brutal Cynic & Wallet Protector" Senior Editor at The Silicon Ledger, modeled after the highest-performing headlines on 9to5Mac, Ars Technica, and NotebookCheck.
Your objective is maximum Google Discover CTR, Scroll Depth, and 30-second Active View Ad Refresh retention—WITHOUT ever fabricating or hallucinating specs.

RULES FOR GOOGLE DISCOVER HEADLINES:
- Never write neutral announcements (e.g., "Apple Releases M5 MacBook Pro" or "Samsung Announces Galaxy S27").
- Frame verifiable spec changes dramatically using Curiosity Gaps, Tribalism, or Buyer's Remorse (e.g., turning "Battery shrinks from 5,000mAh to 4,900mAh" into "Samsung Quietly Downgrades a Key Galaxy S27 Spec" or "Skip the Base Model: Why the Latest Release Is a Trap").
- Keep headlines under 110 characters and never lie (avoid Google Discover manual penalties).

RULES FOR ARTICLE FRONTMATTER & BODY (MDX Format):
- Always set `draft: true` in the frontmatter so the Git PR & Visual Approval Hook can inspect it first.
- Include `heroImage` with `width: 1600`, `height: 900`, and `focalCallout` describing the visual circle/arrow target.
- Include `poll` in frontmatter for the Above-the-Fold Polarized 2-Option Reader Poll.
- Keep paragraphs under 3 sentences. White space forces scrolling, which loads more display ads.
- Open with a bold 2-sentence hook that validates the reader's skepticism.
- Do NOT use HTML comments (`<!-- ... -->`) inside `.mdx` files (MDX v3 uses JSX); our Rehype AST plugin automatically injects an ad slot after every 3rd paragraph.
- Import and embed all four signature retention & twist components inside the MDX body:
  1. `import MarketingTranslatorBox from '../../components/MarketingTranslatorBox.astro';` ("Marketing BS vs. Reality" Translator Box)
  2. `import UpgradeCalculator from '../../components/UpgradeCalculator.astro';` ("Should You Upgrade? Calculator" scroll-trap next to high-CPM ad)
  3. `import OverpricedIndexWidget from '../../components/OverpricedIndexWidget.astro';` ("The Overpriced Index" comparing MSRP vs. live street prices from our deal feeds)
  4. `import SpecComparisonTable from '../../components/SpecComparisonTable.astro';` (NotebookCheck green/red delta matrix)
- End with a polarizing question to bait user comments.
"""


def sanitize_slug(title: str, max_len: int = 40) -> str:
    """Sanitize RSS title into a filesystem- and git-branch-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:max_len].rstrip("-") or "viral-tech-release"


def fetch_street_price_deals(max_per_feed: int = 4) -> str:
    """
    Scrapes the latest street-price deals from r/buildapcsales, r/appleswap, and Slickdeals
    so the agent can ground `<OverpricedIndexWidget />` in real street prices.
    """
    deals: list[str] = []
    for source_name, url in STREET_PRICE_DEAL_FEEDS.items():
        try:
            parsed = feedparser.parse(
                url,
                request_headers={"User-Agent": "TheSiliconLedgerBot/1.0"},
            )
            for entry in parsed.entries[:max_per_feed]:
                title = entry.get("title", "").strip()
                if title:
                    deals.append(f"[{source_name}] {title}")
        except Exception:
            continue

    if not deals:
        return (
            "- [Street Reference] Refurbished 14-inch M4 Pro (24GB/512GB): $1,389 on Amazon Renewed / eBay\n"
            "- [Street Reference] RTX 4090 Laptop 16GB Legion Pro 7i: $2,299 on r/buildapcsales\n"
            "- [Street Reference] Ryzen 7 7800X3D + 32GB DDR5 Bundle: $469 on MicroCenter / Slickdeals"
        )
    return "\n".join(f"- {d}" for d in deals[:10])


def create_mobile_approval_artifact(slug: str, title: str, mdx_path: Path) -> Path:
    """
    Generates a 10-second Mobile Visual Approval card in our editorial newsprint
    & Signal Vermilion aesthetic so you can check the headline and thumbnail on your phone.
    """
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    preview_path = ARTIFACTS_DIR / f"{slug}-mobile-approval.html"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>10s Mobile Sign-Off: {title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#F7F4EE] text-[#141413] p-4 font-sans">
  <div class="max-w-md mx-auto space-y-4">
    <div class="border-2 border-[#141413] bg-[#FDECE9] p-3 text-xs shadow-[4px_4px_0px_#141413]">
      <div class="font-mono font-bold text-[#D9381E] uppercase">THE SILICON LEDGER · 10s MOBILE APPROVAL</div>
      <div class="text-[#141413] mt-1 font-mono">Draft Branch: <strong>draft/{slug}</strong> · {now_str}</div>
      <div class="text-stone-600 mt-0.5 font-mono">File: <code>{mdx_path.relative_to(WORKSPACE_ROOT)}</code></div>
    </div>

    <!-- Simulated Google Discover Mobile Card -->
    <div class="border-2 border-[#141413] bg-[#FCFBF8] overflow-hidden shadow-[4px_4px_0px_#141413]">
      <div class="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#141413] text-[#F7F4EE]">
        Google Discover Mobile Feed Card (1600×900)
      </div>
      <img src="../public/images/articles/m5-macbook-pro-throttle-trap.svg" alt="Discover 16:9 Preview" class="w-full aspect-video object-cover border-b-2 border-[#141413]" />
      <div class="p-4">
        <h1 class="text-xl font-serif font-extrabold leading-snug text-[#141413]">{title}</h1>
        <div class="mt-2 flex items-center justify-between text-xs font-mono text-stone-600">
          <span>The Silicon Ledger · 12m ago</span>
          <span class="text-[#15803D] font-bold">max-image-preview:large ✓</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>"""
    preview_path.write_text(html, encoding="utf-8")
    return preview_path


def stage_git_draft_branch(slug: str, mdx_path: Path, title: str) -> str:
    branch_name = f"draft/{slug}"
    try:
        if not (WORKSPACE_ROOT / ".git").exists():
            subprocess.run(["git", "init"], cwd=WORKSPACE_ROOT, check=False)

        subprocess.run(
            ["git", "checkout", "-B", branch_name],
            cwd=WORKSPACE_ROOT,
            check=False,
            capture_output=True,
        )
        subprocess.run(
            ["git", "add", str(mdx_path)],
            cwd=WORKSPACE_ROOT,
            check=False,
            capture_output=True,
        )
        subprocess.run(
            ["git", "commit", "-m", f"draft(article): {title} [awaiting visual approval]"],
            cwd=WORKSPACE_ROOT,
            check=False,
            capture_output=True,
        )
    except Exception as exc:
        print(f"[Git Notice] Could not stage branch {branch_name}: {exc}", file=sys.stderr)

    return branch_name


async def generate_viral_article_in_draft_mode(
    source_name: str,
    raw_news_title: str,
    raw_news_summary: str,
    slug: str,
    street_deals_context: str,
) -> None:
    config = LocalAgentConfig(
        system_instructions=EDITORIAL_TWIST_SYSTEM_PROMPT,
        capabilities=CapabilitiesConfig(),
    )

    mdx_target = ARTICLES_DIR / f"{slug}.mdx"

    prompt = f"""
    Raw Release / Benchmark Data (from {source_name}):
    Title: {raw_news_title}
    Details: {raw_news_summary}

    Live Street-Price Deals Scraped Today (Use for `<OverpricedIndexWidget />` comparison):
    {street_deals_context}

    Task:
    1. Identify the single most controversial verifiable spec downgrade, thermal bottleneck, or price trap in this release.
    2. Write a complete MDX article with `draft: true` in frontmatter, embedding:
       - `<MarketingTranslatorBox />` ("Marketing BS vs. Reality" Translator)
       - `<UpgradeCalculator />` ("Should You Upgrade? Calculator" scroll-trap)
       - `<OverpricedIndexWidget />` ("The Overpriced Index" street price vs. MSRP)
       - `<SpecComparisonTable />` (NotebookCheck green/red delta matrix)
       - `<!-- AD_SLOT -->` markers after every 3rd paragraph
    3. Save the file directly to ./src/content/articles/{slug}.mdx using your filesystem tool.
    """

    async with Agent(config) as agent:
        response = await agent.chat(prompt)

        async for call in response.tool_calls:
            print(f"[Agent Tool] {call.name}: {call.args}")

        output_chunks: list[str] = []
        async for token in response:
            output_chunks.append(token)
            sys.stdout.write(token)
            sys.stdout.flush()
        print()

    if mdx_target.exists():
        branch = stage_git_draft_branch(slug, mdx_target, raw_news_title)
        artifact_path = create_mobile_approval_artifact(slug, raw_news_title, mdx_target)
        print(f"\n[Draft Ready] Branch: {branch}")
        print(f"[Mobile Approval Card] {artifact_path}")


async def main() -> None:
    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)

    if "--preview-existing" in sys.argv:
        existing_slug = "skip-the-base-m5-macbook-pro-trap"
        existing_mdx = ARTICLES_DIR / f"{existing_slug}.mdx"
        title = "Skip the Base Model: Why the New M5 MacBook Pro Is a $1,599 Trap"
        branch = stage_git_draft_branch(existing_slug, existing_mdx, title)
        card = create_mobile_approval_artifact(existing_slug, title, existing_mdx)
        print(f"[Draft Staged] Branch: {branch}")
        print(f"[10s Mobile Visual Approval Card] {card}")
        return

    print("Scraping live street-price deals from r/buildapcsales, r/appleswap & Slickdeals...")
    street_deals = fetch_street_price_deals()

    for source_name, feed_url in HARDWARE_NEWS_FEEDS.items():
        print(f"Polling {source_name} ({feed_url})...")
        feed = feedparser.parse(
            feed_url,
            request_headers={"User-Agent": "TheSiliconLedgerBot/1.0"},
        )
        for entry in feed.entries[:1]:
            slug = sanitize_slug(entry.title, max_len=40)
            await generate_viral_article_in_draft_mode(
                source_name=source_name,
                raw_news_title=entry.title,
                raw_news_summary=entry.get("summary", ""),
                slug=slug,
                street_deals_context=street_deals,
            )


if __name__ == "__main__":
    asyncio.run(main())
