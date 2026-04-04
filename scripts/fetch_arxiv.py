"""
Fetch recent arxiv papers and convert them into ReScratch challenge stubs.

Usage:
    python scripts/fetch_arxiv.py                         # 10 papers, default categories
    python scripts/fetch_arxiv.py --max 20                # 20 papers
    python scripts/fetch_arxiv.py --cat cs.LG cs.CV       # specific categories
    python scripts/fetch_arxiv.py --query "fine-tuning"   # keyword search
    python scripts/fetch_arxiv.py --out data/challenges.json  # merge into existing file

Output is printed as JSON stubs you can paste into data/challenges.json,
or merged in-place with --out.
"""

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ARXIV_API = "http://export.arxiv.org/api/query"

# Arxiv category → ReScratch tags
CATEGORY_TAGS = {
    "cs.LG": ["machine-learning", "CS"],
    "cs.AI": ["AI", "CS"],
    "cs.CV": ["computer-vision", "deep-learning", "CS"],
    "cs.CL": ["NLP", "LLM", "CS"],
    "cs.NE": ["deep-learning", "neural-networks", "CS"],
    "stat.ML": ["machine-learning", "statistics"],
    "cs.IR": ["data-mining", "information-retrieval", "CS"],
    "cs.DS": ["algorithms", "data-structures", "CS"],
    "cs.DB": ["data-mining", "databases", "CS"],
}

DEFAULT_CATEGORIES = ["cs.LG", "cs.CL", "cs.CV", "cs.AI", "stat.ML"]


def fetch_papers(categories: list[str], query: str, max_results: int) -> list[dict]:
    """Query the arxiv API and return parsed paper dicts."""
    if query:
        search_query = f"({query}) AND cat:({' OR '.join(categories)})"
    else:
        search_query = "cat:(" + " OR ".join(categories) + ")"

    params = urllib.parse.urlencode({
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    })

    url = f"{ARXIV_API}?{params}"
    print(f"Fetching: {url}", file=sys.stderr)

    with urllib.request.urlopen(url, timeout=15) as resp:
        xml_data = resp.read()

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "arxiv": "http://arxiv.org/schemas/atom",
    }
    root = ET.fromstring(xml_data)
    papers = []

    for entry in root.findall("atom:entry", ns):
        arxiv_id_raw = entry.find("atom:id", ns).text.strip()
        arxiv_id = arxiv_id_raw.split("/abs/")[-1]  # e.g. "2401.12345v1" → strip "v\d+"
        arxiv_id = re.sub(r"v\d+$", "", arxiv_id)

        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        abstract = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
        # Truncate abstract to ~250 chars for the description field
        short_abstract = abstract if len(abstract) <= 280 else abstract[:277] + "…"

        # Primary category
        primary_cat_el = entry.find("arxiv:primary_category", ns)
        primary_cat = primary_cat_el.attrib.get("term", "") if primary_cat_el is not None else ""

        # All categories
        all_cats = [
            c.attrib.get("term", "")
            for c in entry.findall("atom:category", ns)
        ]

        # Build tags from categories
        tags = set()
        for cat in all_cats:
            tags.update(CATEGORY_TAGS.get(cat, []))
        if not tags:
            tags.add("CS")

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "abstract": short_abstract,
            "primary_category": primary_cat,
            "tags": sorted(tags),
        })

    return papers


def paper_to_challenge(paper: dict, level: int) -> dict:
    """Convert an arxiv paper into a ReScratch challenge stub."""
    slug = re.sub(r"[^a-z0-9]+", "_", paper["arxiv_id"].replace(".", "_"))
    challenge_id = f"arxiv_{slug}"

    # Infer difficulty from level
    if level <= 2:
        difficulty = "beginner"
    elif level <= 5:
        difficulty = "intermediate"
    elif level <= 7:
        difficulty = "advanced"
    else:
        difficulty = "expert"

    return {
        "id": challenge_id,
        "arxiv_id": paper["arxiv_id"],
        "title": f"[{paper['arxiv_id']}] {paper['title']}",
        "difficulty": difficulty,
        "level": level,
        "description": paper["abstract"],
        "available_categories": [
            "HYPOTHESIS", "VARIABLE", "METHOD", "SAMPLE",
            "DATA_COLLECTION", "ANALYSIS", "CONCLUSION"
        ],
        "hints": [
            "TODO: Add hint 1 here",
            "TODO: Add hint 2 here",
        ],
        "tags": paper["tags"],
        "_source": "arxiv",
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch arxiv papers as ReScratch challenge stubs")
    parser.add_argument("--max", type=int, default=10, help="Number of papers to fetch (default: 10)")
    parser.add_argument("--cat", nargs="+", default=DEFAULT_CATEGORIES, metavar="CATEGORY",
                        help=f"Arxiv categories (default: {' '.join(DEFAULT_CATEGORIES)})")
    parser.add_argument("--query", type=str, default="", help="Keyword search query")
    parser.add_argument("--out", type=str, default="",
                        help="Path to challenges.json to merge stubs into (default: print to stdout)")
    parser.add_argument("--start-level", type=int, default=9,
                        help="Starting level number for generated challenges (default: 9)")
    args = parser.parse_args()

    papers = fetch_papers(args.cat, args.query, args.max)
    print(f"Fetched {len(papers)} papers.", file=sys.stderr)

    stubs = [
        paper_to_challenge(paper, args.start_level + i)
        for i, paper in enumerate(papers)
    ]

    if args.out:
        out_path = Path(args.out)
        if out_path.exists():
            existing = json.loads(out_path.read_text(encoding="utf-8"))
            existing_ids = {c["id"] for c in existing.get("challenges", [])}
            new_stubs = [s for s in stubs if s["id"] not in existing_ids]
            existing["challenges"].extend(new_stubs)
            out_path.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"Added {len(new_stubs)} new challenges to {out_path} (skipped {len(stubs) - len(new_stubs)} duplicates).")
        else:
            out_path.write_text(json.dumps({"challenges": stubs}, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"Written {len(stubs)} challenges to {out_path}.")
    else:
        print(json.dumps({"challenges": stubs}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
