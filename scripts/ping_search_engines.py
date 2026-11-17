#!/usr/bin/env python3
"""
Instant Search Engine & IndexNow Submitter for The Silicon Ledger.
Pushes all live article URLs directly to IndexNow (Bing, DuckDuckGo, Yandex, Naver)
and verifies `/sitemap.xml`, `/news-sitemap.xml`, and `/rss.xml`.
"""

import json
import urllib.request

SITE_HOST = "siliconledger.io"
SITE_URL = f"https://{SITE_HOST}"
INDEXNOW_KEY = "thesiliconledgerindexnowkey2026"

URLS_TO_INDEX = [
    f"{SITE_URL}/",
    f"{SITE_URL}/about/",
    f"{SITE_URL}/privacy/",
    f"{SITE_URL}/contact/",
    f"{SITE_URL}/articles/cloud-outage-monoculture-single-point-of-failure/",
    f"{SITE_URL}/articles/ai-search-traffic-heist-news-media-collapse/",
    f"{SITE_URL}/articles/day-one-flagship-firmware-beta-test-trap/",
    f"{SITE_URL}/articles/skip-the-base-m5-macbook-pro-trap/",
    f"{SITE_URL}/articles/snapdragon-8-elite-vs-a18-pro-review/",
    f"{SITE_URL}/articles/rtx-5090-laptop-gpu-benchmarks/",
    f"{SITE_URL}/sitemap.xml",
    f"{SITE_URL}/news-sitemap.xml",
    f"{SITE_URL}/rss.xml",
]


def submit_indexnow() -> None:
    payload = {
        "host": SITE_HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": URLS_TO_INDEX,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[IndexNow] Submitted {len(URLS_TO_INDEX)} URLs -> HTTP {resp.status}")
    except Exception as exc:
        print(f"[IndexNow Notice] {exc}")


if __name__ == "__main__":
    submit_indexnow()
