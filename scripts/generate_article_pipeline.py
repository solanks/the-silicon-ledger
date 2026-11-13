#!/usr/bin/env python3
"""
Automated RSS-to-MDX Hardware Article Pipeline powered by:
- google-antigravity (Antigravity Python SDK)
- feedparser (RSS/Atom hardware news ingestion)
- pydantic (Strict schema validation matching src/content/config.ts)

Usage:
    pip install google-antigravity feedparser pydantic
    export GEMINI_API_KEY="your_api_key_here"
    python3 scripts/generate_article_pipeline.py
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import sys
from typing import Literal, Optional, Union

import feedparser
from pydantic import BaseModel, Field, HttpUrl, field_validator
from google.antigravity import Agent, CapabilitiesConfig, LocalAgentConfig

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = WORKSPACE_ROOT / "src" / "content" / "articles"

DEFAULT_RSS_FEEDS = [
    "https://www.notebookcheck.net/RSS-Feed-Notebook-Reviews.8156.0.html",
    "https://www.phoronix.com/rss.php",
]


# ---------------------------------------------------------------------------
# 1. Pydantic Models Mirroring src/content/config.ts
# ---------------------------------------------------------------------------

CategoryType = Literal[
    "Silicon & SoCs",
    "Laptops & GPUs",
    "Smartphones",
    "Displays & Audio",
    "AI Hardware",
]


class AuthorModel(BaseModel):
    name: str = "Dr. Elena Vance"
    role: str = "Chief Silicon Architect"
    avatar: str = "/images/authors/default-editor.svg"
    url: HttpUrl = Field(default="https://techpulse.example.com/authors/elena-vance")


class HeroImageModel(BaseModel):
    src: str = "/images/articles/snapdragon-8-elite-vs-a18-pro.svg"
    alt: str
    width: int = Field(default=1600, ge=1200)
    height: int = Field(default=900, ge=675)
    caption: Optional[str] = None


class VerdictModel(BaseModel):
    score: float = Field(..., ge=0.0, le=10.0)
    award: Optional[str] = None
    summary: str
    pros: list[str] = Field(..., min_length=2)
    cons: list[str] = Field(..., min_length=2)
    price: Optional[str] = None
    buyUrl: Optional[HttpUrl] = None


class DeviceHeaderModel(BaseModel):
    name: str
    chip: Optional[str] = None
    price: Optional[str] = None
    isReviewed: bool = False


class SpecRowModel(BaseModel):
    category: Optional[str] = None
    label: str
    unit: str = ""
    higherIsBetter: bool = True
    values: list[Union[float, int, str]]


class SpecComparisonModel(BaseModel):
    title: str
    subtitle: Optional[str] = None
    baselineIndex: int = 0
    devices: list[DeviceHeaderModel]
    rows: list[SpecRowModel]


class GeneratedArticlePayload(BaseModel):
    slug: str
    title: str = Field(..., max_length=110)
    subtitle: str
    description: str = Field(..., min_length=50, max_length=220)
    category: CategoryType = "Silicon & SoCs"
    tags: list[str]
    readingTimeMinutes: int = Field(default=7, ge=3, le=25)
    author: AuthorModel = Field(default_factory=AuthorModel)
    heroImage: HeroImageModel
    verdict: VerdictModel
    specComparison: SpecComparisonModel
    bodyParagraphs: list[str] = Field(
        ...,
        min_length=9,
        description="At least 9 paragraphs so Rehype injects 3+ in-content ad units (every 3 paragraphs).",
    )

    @field_validator("slug")
    @classmethod
    def sanitize_slug(cls, value: str) -> str:
        clean = re.sub(r"[^a-z0-9-]+", "-", value.lower()).strip("-")
        return clean or "hardware-lab-review"


# ---------------------------------------------------------------------------
# 2. RSS Feed Ingestion (feedparser)
# ---------------------------------------------------------------------------


class RssTopicItem(BaseModel):
    title: str
    link: str
    summary: str
    published: str


def fetch_latest_rss_topics(feed_urls: list[str], limit: int = 3) -> list[RssTopicItem]:
    topics: list[RssTopicItem] = []
    for url in feed_urls:
        try:
            parsed = feedparser.parse(url)
            for entry in parsed.entries[:limit]:
                topics.append(
                    RssTopicItem(
                        title=entry.get("title", "Untitled Hardware Release"),
                        link=entry.get("link", ""),
                        summary=re.sub(r"<[^>]+>", "", entry.get("summary", ""))[:500],
                        published=entry.get(
                            "published", datetime.now(timezone.utc).isoformat()
                        ),
                    )
                )
        except Exception as exc:
            print(f"[RSS Warning] Could not parse {url}: {exc}", file=sys.stderr)

    if not topics:
        # Offline fallback topic if RSS feeds are unreachable
        topics.append(
            RssTopicItem(
                title="AMD Ryzen AI Max+ 395 'Strix Halo' APU Lab Review vs Apple M4 Max",
                link="https://techpulse.example.com/news/strix-halo-vs-m4-max",
                summary=(
                    "Benchmarking AMD's 16-core Zen 5 Halo APU with 40 RDNA 3.5 Compute Units "
                    "and 256-bit LPDDR5X-8000 unified memory against Apple's 40-core M4 Max."
                ),
                published=datetime.now(timezone.utc).isoformat(),
            )
        )
    return topics


# ---------------------------------------------------------------------------
# 3. MDX Compiler from Validated Pydantic Payload
# ---------------------------------------------------------------------------


def render_mdx_file(payload: GeneratedArticlePayload) -> str:
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    frontmatter_dict = {
        "title": payload.title,
        "subtitle": payload.subtitle,
        "description": payload.description,
        "pubDate": now_iso,
        "updatedDate": now_iso,
        "category": payload.category,
        "tags": payload.tags,
        "featured": False,
        "readingTimeMinutes": payload.readingTimeMinutes,
        "author": payload.author.model_dump(mode="json"),
        "heroImage": payload.heroImage.model_dump(mode="json", exclude_none=True),
        "verdict": payload.verdict.model_dump(mode="json", exclude_none=True),
        "specComparison": payload.specComparison.model_dump(
            mode="json", exclude_none=True
        ),
    }

    # Format YAML-compatible JSON frontmatter (valid YAML 1.2 subset)
    frontmatter_yaml = json.dumps(frontmatter_dict, indent=2)

    paragraphs_md = []
    for idx, para in enumerate(payload.bodyParagraphs, start=1):
        paragraphs_md.append(para.strip())
        if idx == 3:
            paragraphs_md.append("## Architecture & Die-Level Power Telemetry")
        elif idx == 6:
            paragraphs_md.append("## Sustained Thermal & Frame-Time Analysis")

    body_text = "\n\n".join(paragraphs_md)
    return f"---\n{frontmatter_yaml}\n---\n\n{body_text}\n"


# ---------------------------------------------------------------------------
# 4. Antigravity Python SDK Agent Orchestration
# ---------------------------------------------------------------------------

SYSTEM_INSTRUCTIONS = """You are the Senior Silicon & Hardware Editor at TechPulse Labs.
You generate Google Discover optimized, deeply technical hardware review payloads.
When given an RSS news item, respond ONLY with a valid JSON object matching the
GeneratedArticlePayload schema (no markdown code fences around the JSON) containing:
- title (<= 110 chars, high-contrast Google Discover headline)
- slug (kebab-case URL slug)
- subtitle, description (50-220 chars), category, tags, readingTimeMinutes
- heroImage (1600x900 16:9 image metadata)
- verdict (score 0-10, award, summary, pros[], cons[], price)
- specComparison (NotebookCheck-style 3-device comparison matrix with numeric benchmark rows)
- bodyParagraphs (array of at least 9 detailed technical paragraphs so our Astro Rehype plugin injects an in-content ad after every 3rd paragraph).
"""


async def generate_article_with_antigravity(topic: RssTopicItem) -> Path:
    if not os.environ.get("GEMINI_API_KEY"):
        print(
            "[Notice] GEMINI_API_KEY is not set in environment. "
            "Export GEMINI_API_KEY before running live agent generation.",
            file=sys.stderr,
        )

    config = LocalAgentConfig(
        system_instructions=SYSTEM_INSTRUCTIONS,
        capabilities=CapabilitiesConfig(),
    )

    prompt = (
        f"Create a complete GeneratedArticlePayload JSON for this hardware story:\n"
        f"Title: {topic.title}\n"
        f"Summary: {topic.summary}\n"
        f"Source URL: {topic.link}\n\n"
        f"JSON Schema:\n{json.dumps(GeneratedArticlePayload.model_json_schema(), indent=2)}"
    )

    collected_tokens: list[str] = []

    async with Agent(config) as agent:
        response = await agent.chat(prompt)

        # Stream internal reasoning / thoughts
        async for thought in response.thoughts:
            sys.stderr.write(f"[Thinking] {thought}\n")

        # Stream any tool executions
        async for call in response.tool_calls:
            sys.stderr.write(f"[Tool Call] {call.name}({call.args})\n")

        # Stream response tokens
        async for token in response:
            collected_tokens.append(token)
            sys.stdout.write(token)
            sys.stdout.flush()
        print()

    raw_output = "".join(collected_tokens).strip()
    # Strip optional markdown code fences if present
    cleaned_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_output, flags=re.DOTALL)

    validated = GeneratedArticlePayload.model_validate_json(cleaned_json)
    mdx_content = render_mdx_file(validated)

    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
    output_path = ARTICLES_DIR / f"{validated.slug}.mdx"
    output_path.write_text(mdx_content, encoding="utf-8")
    print(f"\n[Success] Wrote validated MDX article to: {output_path}")
    return output_path


async def main() -> None:
    print("Fetching latest hardware topics via feedparser...")
    topics = fetch_latest_rss_topics(DEFAULT_RSS_FEEDS, limit=1)
    selected = topics[0]
    print(f"Selected Topic: {selected.title}")

    if "--dry-run" in sys.argv:
        sample = GeneratedArticlePayload(
            slug="amd-strix-halo-ryzen-ai-max-395-review",
            title="AMD Ryzen AI Max+ 395 'Strix Halo' Review: 40-CU RDNA 3.5 Challenges Discrete GPUs",
            subtitle="Testing AMD's 256-bit unified memory Halo APU against Apple M4 Max and RTX 4070 Laptop GPU.",
            description="Full lab review and NotebookCheck-style benchmarks of the AMD Ryzen AI Max+ 395 Strix Halo APU with 16 Zen 5 cores and Radeon 8060S graphics.",
            category="Laptops & GPUs",
            tags=["AMD Strix Halo", "Ryzen AI Max+ 395", "Radeon 8060S", "Unified Memory"],
            readingTimeMinutes=7,
            heroImage=HeroImageModel(
                src="/images/articles/rtx-5090-laptop-gpu.svg",
                alt="AMD Ryzen AI Max+ 395 Strix Halo APU Die & Benchmark Chart",
                caption="Strix Halo pairs two 8-core Zen 5 CCDs with a massive 40-CU RDNA 3.5 graphics & media die."
            ),
            verdict=VerdictModel(
                score=9.1,
                award="Editor's Choice APU",
                price="$2,199",
                summary="By pairing a 256-bit LPDDR5X-8000 bus with 32 MB of Infinity Cache and 40 RDNA 3.5 CUs, AMD's Strix Halo eliminates the need for a discrete mid-range laptop GPU.",
                pros=[
                    "Up to 96 GB of allocatable unified VRAM for local 70B LLM inference",
                    "Radeon 8060S matches a 105W GeForce RTX 4070 Laptop GPU in rasterization",
                    "16 full-sized Zen 5 cores deliver desktop-class multi-threaded throughput"
                ],
                cons=[
                    "Requires soldered 8-channel LPDDR5X-8000 memory (non-upgradeable)",
                    "Peak 120W APU package power demands substantial vapor-chamber cooling"
                ]
            ),
            specComparison=SpecComparisonModel(
                title="AMD Ryzen AI Max+ 395 vs. Apple M4 Max vs. Intel Core Ultra 9 288V",
                subtitle="Pydantic-validated NotebookCheck comparison matrix generated by scripts/generate_article_pipeline.py",
                baselineIndex=0,
                devices=[
                    DeviceHeaderModel(name="Ryzen AI Max+ 395", chip="16C Zen 5 · 40CU", price="$2,199", isReviewed=True),
                    DeviceHeaderModel(name="Apple M4 Max", chip="16C CPU · 40C GPU", price="$3,499", isReviewed=False),
                    DeviceHeaderModel(name="Core Ultra 9 288V", chip="8C Lion Cove/Skymont", price="$1,499", isReviewed=False)
                ],
                rows=[
                    SpecRowModel(category="CPU Compute", label="Cinebench 2024 Multi-Core", unit="pts", higherIsBetter=True, values=[2140, 2310, 1020]),
                    SpecRowModel(category="GPU Graphics", label="3DMark Time Spy Graphics", unit="pts", higherIsBetter=True, values=[11850, 13400, 4450]),
                    SpecRowModel(category="Memory Subsystem", label="Memory Bandwidth", unit="GB/s", higherIsBetter=True, values=[256, 546, 136]),
                    SpecRowModel(category="Power Envelope", label="Sustained Package TDP", unit="W", higherIsBetter=False, values=[115, 78, 30])
                ]
            ),
            bodyParagraphs=[
                "For years, x86 integrated graphics were bottlenecked by a narrow 128-bit memory bus shared reluctantly with the CPU cores. AMD's Ryzen AI Max+ 395—codenamed Strix Halo—shatters that ceiling by adopting a chiplet architecture with a 256-bit LPDDR5X-8000 memory interface.",
                "On the substrate sit two 8-core Zen 5 CCDs connected via a high-efficiency sea-of-wires fan-out link to a massive central I/O and graphics die housing 40 RDNA 3.5 Compute Units (branded Radeon 8060S) and 32 MB of MALL (Infinity Cache).",
                "In our lab testing at 80W and 120W thermal envelopes, the Radeon 8060S routinely traded blows with a discrete NVIDIA GeForce RTX 4070 Laptop GPU while consuming significantly less total board power.",
                "Because all 128 GB of system LPDDR5X-8000 memory sits on a unified address space, users can assign up to 96 GB directly as dedicated GPU frame buffer in the BIOS—a capability previously exclusive to Apple's M-series Max and Ultra MacBook Pros.",
                "Running Llama-3.3-70B-Instruct (Q4_K_M) locally via llama.cpp, Strix Halo sustained 14.2 tokens per second without touching PCIe swap, outclassing every 16 GB and 24 GB discrete laptop GPU on the market.",
                "On the CPU side, having 16 full-cache Zen 5 cores (rather than a mix of standard and compact Zen 5c cores) propels Cinebench 2024 multi-core scores to 2,140 points.",
                "Thermal management inside a 14-inch tablet-workstation chassis remains impressive: surface temperatures peaked at 42.1°C on the rear magnesium cover during our 30-minute stress loop.",
                "Gaming at 2560×1600 native resolution in Cyberpunk 2077 and Baldur's Gate 3 averaged above 68 FPS on High presets before enabling FSR 3.1 frame generation.",
                "Overall, Strix Halo marks a watershed moment for x86 mobile workstations, uniting high-VRAM AI capability with genuine 1440p gaming performance on a single package."
            ]
        )
        mdx_content = render_mdx_file(sample)
        ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
        out = ARTICLES_DIR / f"{sample.slug}.mdx"
        out.write_text(mdx_content, encoding="utf-8")
        print(f"[Dry-Run Success] Wrote validated MDX article to: {out}")
        return

    await generate_article_with_antigravity(selected)


if __name__ == "__main__":
    asyncio.run(main())
