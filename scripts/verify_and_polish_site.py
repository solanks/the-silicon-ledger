#!/usr/bin/env python3
"""
Editorial Site Verifier & Image/Layout Auditor Agent powered by:
- Deterministic static checks (--audit, no API key required)
- google-antigravity (Antigravity Python SDK) for autonomous remediation

Checks:
1. Published MDX articles: frontmatter, draft status, formatting, and links.
2. Hero images: flags AI-looking .svg diagrams/circles and verifies local raster photos.
3. Placeholder URLs: flags example.com and broken /images/ or /articles/ references.
4. Layout & RSS: checks BaseLayout, ArticleLayout, and rss.xml.ts for common issues.

Usage:
    python3 scripts/verify_and_polish_site.py --audit
    export GEMINI_API_KEY="your_api_key_here"
    python3 scripts/verify_and_polish_site.py
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
import os
from pathlib import Path
import re
import sys

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = WORKSPACE_ROOT / "src" / "content" / "articles"
PUBLIC_DIR = WORKSPACE_ROOT / "public"
SRC_DIR = WORKSPACE_ROOT / "src"


@dataclass
class AuditReport:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    checked_articles: int = 0

    def add_error(self, msg: str) -> None:
        self.errors.append(msg)

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)


def check_local_asset(asset_path: str) -> bool:
    """Return True if a /images/... path exists in public/."""
    rel = asset_path.lstrip("/")
    return (PUBLIC_DIR / rel).is_file()


def audit_articles(report: AuditReport) -> None:
    """Validate all published MDX articles for images, links, formatting, and drafts."""
    article_files = sorted(ARTICLES_DIR.glob("*.mdx"))
    report.checked_articles = len(article_files)
    valid_slugs = {p.stem for p in article_files}

    for path in article_files:
        text = path.read_text(encoding="utf-8")
        parts = text.split("---", 2)
        if len(parts) < 3:
            report.add_error(f"{path.name}: Missing or malformed YAML frontmatter delimiters.")
            continue

        frontmatter, body = parts[1], parts[2]

        # 1. Hero image checks (flag SVG diagrams & red-circle callouts)
        hero_match = re.search(r"heroImage:\s*\n((?:\s+.*\n)+)", frontmatter)
        if not hero_match:
            report.add_error(f"{path.name}: Missing heroImage block in frontmatter.")
        else:
            hero_block = hero_match.group(1)
            src_match = re.search(r'src:\s*["\']([^"\']+)["\']', hero_block)
            if not src_match:
                report.add_error(f"{path.name}: heroImage.src is missing.")
            else:
                src = src_match.group(1)
                if src.endswith(".svg"):
                    report.add_error(
                        f"{path.name}: heroImage.src uses AI-style SVG diagram ({src}); replace with real photography."
                    )
                if not check_local_asset(src):
                    report.add_error(f"{path.name}: heroImage.src does not exist on disk ({src}).")

            if re.search(r"Red Circle:|Diagram\b", hero_block, re.IGNORECASE):
                report.add_warning(
                    f"{path.name}: heroImage metadata still mentions 'Red Circle' or 'Diagram'."
                )

        # 2. Placeholder URL checks
        for match in re.finditer(r"https?://[^\s\"')>]+example\.com[^\s\"')>]*", text):
            report.add_error(f"{path.name}: Placeholder URL found ({match.group(0)}).")

        # 3. Draft status check
        if re.search(r"^\s*draft:\s*true\s*$", frontmatter, re.MULTILINE):
            report.add_warning(f"{path.name}: Article is marked draft: true.")

        # 4. Markdown / internal link checks
        for link_text, url in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", body):
            if not url.strip():
                report.add_error(f"{path.name}: Empty link target for [{link_text}].")
            elif url.startswith("/articles/"):
                target_slug = url.removeprefix("/articles/").strip("/")
                if target_slug not in valid_slugs:
                    report.add_error(f"{path.name}: Broken internal article link ({url}).")
            elif url.startswith("/images/") and not check_local_asset(url):
                report.add_error(f"{path.name}: Broken local image link ({url}).")

        # 5. Basic formatting checks
        if not body.strip():
            report.add_error(f"{path.name}: Article body is empty.")
        if body.count("```") % 2 != 0:
            report.add_error(f"{path.name}: Unclosed fenced code block (```).")


def audit_site_files(report: AuditReport) -> None:
    """Check Astro layouts, config, and RSS/sitemap endpoints for layout or link issues."""
    for file_path in sorted(SRC_DIR.rglob("*")):
        if not file_path.is_file() or file_path.suffix not in {".astro", ".ts", ".mjs"}:
            continue
        rel = file_path.relative_to(WORKSPACE_ROOT)
        text = file_path.read_text(encoding="utf-8")

        for match in re.finditer(r"https?://[^\s\"')>]+example\.com[^\s\"')>]*", text):
            report.add_error(f"{rel}: Placeholder URL found ({match.group(0)}).")

    rss_path = SRC_DIR / "pages" / "rss.xml.ts"
    if rss_path.is_file():
        rss_text = rss_path.read_text(encoding="utf-8")
        if 'type="image/svg+xml"' in rss_text:
            report.add_error("src/pages/rss.xml.ts: Hardcodes enclosure type='image/svg+xml'.")

    article_layout = SRC_DIR / "layouts" / "ArticleLayout.astro"
    if article_layout.is_file():
        layout_text = article_layout.read_text(encoding="utf-8")
        if "NewsArticle Schema" in layout_text:
            report.add_warning("src/layouts/ArticleLayout.astro: Exposes developer schema badge to readers.")
        if "Social / Discover Card" in layout_text:
            report.add_warning("src/layouts/ArticleLayout.astro: Exposes OG generator debug box in sidebar.")

    base_layout = SRC_DIR / "layouts" / "BaseLayout.astro"
    if base_layout.is_file():
        base_text = base_layout.read_text(encoding="utf-8")
        if "md:hidden" not in base_text:
            report.add_warning("src/layouts/BaseLayout.astro: Navigation appears hidden on mobile (no md:hidden nav).")


def run_audit() -> int:
    report = AuditReport()
    audit_articles(report)
    audit_site_files(report)

    print(f"=== Editorial Site Verification Report ({report.checked_articles} articles) ===")
    if report.errors:
        print(f"\nErrors ({len(report.errors)}):")
        for err in report.errors:
            print(f"  [ERROR] {err}")
    if report.warnings:
        print(f"\nWarnings ({len(report.warnings)}):")
        for warn in report.warnings:
            print(f"  [WARN]  {warn}")
    if not report.errors and not report.warnings:
        print("\n[PASS] All articles, images, links, formatting, and layout checks passed.")
    return 1 if report.errors else 0


async def run_antigravity_verifier() -> None:
    """Invoke the Antigravity agent to autonomously inspect and fix any audit findings."""
    if not os.environ.get("GEMINI_API_KEY"):
        print("GEMINI_API_KEY not set. Running deterministic --audit mode instead.\n")
        sys.exit(run_audit())

    from google.antigravity import Agent, CapabilitiesConfig, LocalAgentConfig

    config = LocalAgentConfig(
        model="gemini-2.5-pro",
        workspace_root=str(WORKSPACE_ROOT),
        capabilities=CapabilitiesConfig(
            file_read=True,
            file_write=True,
            bash=True,
            web_search=True,
        ),
    )

    prompt = (
        "Follow the instructions in .agents/skills/editorial-site-verifier/SKILL.md. "
        "Run `python3 scripts/verify_and_polish_site.py --audit`, resolve every error and warning "
        "(replacing any SVG diagram hero images with real landscape hardware photography in public/images/articles/, "
        "fixing placeholder links, formatting, and layout issues), and re-run --audit to confirm a clean pass."
    )

    async with Agent(config) as agent:
        response = await agent.chat(prompt)
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()
        print()


if __name__ == "__main__":
    if "--audit" in sys.argv:
        sys.exit(run_audit())
    asyncio.run(run_antigravity_verifier())
