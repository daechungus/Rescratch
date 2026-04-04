"""
Enrich challenges.json with Gemini-suggested pillar, subtopic, and variable fields.

Usage:
    export GEMINI_API_KEY=your_key_here
    python scripts/enrich_challenges.py

Options:
    --dry-run   Print what would change without writing to disk
    --only-missing  Skip challenges that already have pillar + subtopic set
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: google-generativeai not installed. Run: pip install google-generativeai")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

CHALLENGES_PATH = Path(__file__).parent.parent / "data" / "challenges.json"

VALID_PILLARS = ["science", "technology", "engineering", "mathematics", "human_social"]

VALID_SUBTOPICS = [
    # science
    "biology_molecular", "biology_organismal", "bioinformatics",
    "physics_theoretical", "physics_applied", "astrophysics",
    "chemistry_organic", "materials_science",
    # technology
    "machine_learning", "reinforcement_learning", "nlp", "computer_vision",
    "cybersecurity_crypto", "cybersecurity_network", "hci",
    # engineering
    "mechanical_aerospace", "electrical_computer", "civil_environmental", "bioengineering",
    # mathematics
    "pure_math", "applied_math_finance", "game_theory", "cryptography_logic", "statistics",
    # human_social
    "psychology", "economics", "sociology",
]

PROMPT_TEMPLATE = """\
Given this research challenge:
Title: {title}
Description: {description}

Return a JSON object with exactly these fields:
{{
  "pillar": one of {pillars},
  "subtopic": one of {subtopics},
  "suggested_variables": {{
    "independent": ["string"],
    "dependent": ["string"],
    "control": ["string", "string"],
    "confounding": ["string"]
  }}
}}

Rules:
- Choose the pillar and subtopic that best match the research domain.
- suggested_variables should be specific to THIS challenge (1–2 independent, 1–2 dependent, 2–4 control, 1–2 confounding).
- Return ONLY valid JSON. No markdown fences, no explanation, no trailing text.
"""


def build_prompt(challenge: dict) -> str:
    return PROMPT_TEMPLATE.format(
        title=challenge.get("title", ""),
        description=challenge.get("description", ""),
        pillars=json.dumps(VALID_PILLARS),
        subtopics=json.dumps(VALID_SUBTOPICS),
    )


def call_gemini(model, challenge: dict) -> dict | None:
    prompt = build_prompt(challenge)
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown fences if Gemini wraps anyway
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        parsed = json.loads(text)

        # Validate required keys
        if parsed.get("pillar") not in VALID_PILLARS:
            print(f"  ⚠  Invalid pillar '{parsed.get('pillar')}' — skipping")
            return None
        if parsed.get("subtopic") not in VALID_SUBTOPICS:
            print(f"  ⚠  Invalid subtopic '{parsed.get('subtopic')}' — skipping")
            return None

        return parsed
    except json.JSONDecodeError as e:
        print(f"  ✗  JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"  ✗  API error: {e}")
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Don't write to disk")
    parser.add_argument("--only-missing", action="store_true",
                        help="Skip challenges that already have pillar + subtopic")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set.")
        sys.exit(1)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    data = json.loads(CHALLENGES_PATH.read_text(encoding="utf-8"))
    challenges = data["challenges"]

    to_process = []
    skipped = 0
    for c in challenges:
        if args.only_missing and c.get("pillar") and c.get("subtopic"):
            skipped += 1
        else:
            to_process.append(c)

    print(f"Challenges total: {len(challenges)}")
    print(f"To process: {len(to_process)}  |  Skipped (already tagged): {skipped}\n")

    failures = []
    pillar_counts: dict[str, int] = {}

    for i, challenge in enumerate(to_process):
        cid = challenge.get("id", f"[{i}]")
        print(f"[{i+1}/{len(to_process)}] {cid} ...", end=" ", flush=True)

        result = call_gemini(model, challenge)

        if result is None:
            failures.append(cid)
            print("FAILED")
        else:
            challenge["pillar"] = result["pillar"]
            challenge["subtopic"] = result["subtopic"]
            challenge["suggested_variables"] = result["suggested_variables"]
            pillar_counts[result["pillar"]] = pillar_counts.get(result["pillar"], 0) + 1
            print(f"→ {result['pillar']} / {result['subtopic']}")

        if i < len(to_process) - 1:
            time.sleep(0.5)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n── Summary ──────────────────────────────────────────────")
    print(f"  Processed : {len(to_process)}")
    print(f"  Succeeded : {len(to_process) - len(failures)}")
    print(f"  Failed    : {len(failures)}")
    if failures:
        print(f"  Failed IDs: {failures}")
    print("\n  Pillar distribution:")
    for pillar, count in sorted(pillar_counts.items()):
        print(f"    {pillar:20s} {count}")

    if args.dry_run:
        print("\n[dry-run] No changes written to disk.")
        return

    if not args.dry_run:
        CHALLENGES_PATH.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(f"\n✓ Written to {CHALLENGES_PATH}")


if __name__ == "__main__":
    main()
