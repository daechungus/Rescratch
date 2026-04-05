"""
Enrich challenges.json with AI-generated context using the Gemini API.

Usage:
    GEMINI_API_KEY=<key> python scripts/enrich_with_gemini.py

Options:
    --ids ID1 ID2 ...   Only process specific challenge IDs
    --force             Re-enrich challenges that already have 'background' field
    --out PATH          Output file (default: data/challenges.json in-place)
    --dry-run           Print prompts without calling the API

Requires: pip install google-genai
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# Load .env from project root if present
_env_file = Path(__file__).parent.parent / ".env"
if _env_file.exists():
    for _line in _env_file.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

ROOT = Path(__file__).parent.parent
DATA_FILE = ROOT / "data" / "challenges.json"

try:
    from google import genai
    from google.genai import types
except ImportError:
    sys.exit("Missing dependency. Run: python -m pip install google-genai")


PROMPT_TEMPLATE = """You are a research methodology professor creating a teaching exercise.

Given this research challenge:
Title: {title}
Question: {description}
Field: {subtopic}
{arxiv_line}

If an arxiv_id is present, this is based on a real paper. Generate content
as if you've read the paper based on the title and question.

Return a JSON object with EXACTLY these fields (no extra keys, no markdown, no explanation):

{{
  "background": {{
    "objective": "2-3 sentences explaining what this research is trying to discover and why it matters. Write for an undergrad who has never seen this paper.",
    "context": "3-4 sentences of background knowledge the student needs. Define key terms. Explain the current state of the field. What do we already know?",
    "task": "1-2 sentences telling the student exactly what to do: Design a research methodology that tests whether [X] affects [Y]. Your pipeline should include appropriate controls and a statistical analysis that matches your data type.",
    "constraints": ["2-4 specific constraints, e.g. Your sample must be large enough for statistical significance", "You need at least one control variable to isolate the effect"],
    "key_terms": [{{"term": "string", "definition": "1 sentence definition"}}, ...]
  }},
  "ideal_pipeline": {{
    "hypothesis_type": "directional_increase|directional_decrease|nondirectional|null",
    "independent_variable": "string",
    "dependent_variable": "string",
    "control_variables": ["string"],
    "confounding_variables": ["string"],
    "method": "one of: method_experiment_lab, method_experiment_field, method_survey, method_observational, method_case_study, method_meta_analysis, method_simulation, method_ablation, method_rct, method_double_blind, method_longitudinal, method_monte_carlo, method_prototype_test, method_ethnography, method_natural_experiment",
    "sample_size": "small|medium|large",
    "sampling_method": "random|stratified|convenience|snowball",
    "data_collection": "best data collection block ID",
    "analysis": "best analysis block ID from: analysis_ttest, analysis_anova, analysis_regression, analysis_chi_square, analysis_correlation, analysis_descriptive, analysis_thematic, analysis_content, analysis_grounded_theory, analysis_network, analysis_time_series",
    "explanation": "2-3 sentences explaining WHY this is the ideal methodology."
  }},
  "common_mistakes": [
    {{"mistake": "description of a common student mistake", "why_wrong": "1 sentence", "better_choice": "what to do instead"}},
    {{"mistake": "...", "why_wrong": "...", "better_choice": "..."}},
    {{"mistake": "...", "why_wrong": "...", "better_choice": "..."}}
  ],
  "grading_rubric": {{
    "must_have": ["list of block choices required for full marks, e.g. Must use a control variable", "Must use quantitative data collection"],
    "bonus": ["list of extras that earn rigor points, e.g. Identifies confounding variables", "Uses random sampling"],
    "penalties": ["list of mistakes that lose points, e.g. Using qualitative analysis with quantitative data", "Sample size too small for chosen method"]
  }}
}}

Return ONLY valid JSON. No markdown code fences. No explanation outside the JSON."""


def build_prompt(challenge: dict) -> str:
    arxiv_line = f"ArXiv ID: {challenge['arxiv_id']}" if challenge.get("arxiv_id") else ""
    return PROMPT_TEMPLATE.format(
        title=challenge.get("title", ""),
        description=challenge.get("description", ""),
        subtopic=challenge.get("subtopic", challenge.get("pillar", "general")),
        arxiv_line=arxiv_line,
    )


def parse_json_response(text: str) -> dict:
    """Strip markdown fences if Gemini adds them, then parse JSON."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # Drop first line (```json or ```) and last line (```)
        text = "\n".join(lines[1:-1]).strip()
    return json.loads(text)


def enrich_challenge(challenge: dict, client, max_retries: int = 5) -> dict:
    prompt = build_prompt(challenge)
    delay = 60  # seconds to wait on first 429
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            enrichment = parse_json_response(response.text)
            break
        except Exception as e:
            msg = str(e)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                # Try to read retryDelay from the error message
                import re
                m = re.search(r"retryDelay.*?(\d+)s", msg)
                wait = int(m.group(1)) + 5 if m else delay
                if attempt < max_retries - 1:
                    print(f"rate-limited, waiting {wait}s...", end=" ", flush=True)
                    time.sleep(wait)
                    delay = min(delay * 2, 300)
                    continue
            raise

    # Merge top-level enrichment keys into challenge (do not overwrite existing non-enrichment keys)
    ENRICH_KEYS = ("background", "ideal_pipeline", "common_mistakes", "grading_rubric")
    for key in ENRICH_KEYS:
        if key in enrichment:
            challenge[key] = enrichment[key]

    return challenge


def main():
    parser = argparse.ArgumentParser(description="Enrich challenges.json with Gemini")
    parser.add_argument("--ids", nargs="*", help="Only enrich these challenge IDs")
    parser.add_argument("--force", action="store_true", help="Re-enrich already enriched challenges")
    parser.add_argument("--out", default=str(DATA_FILE), help="Output path")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts, no API calls")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("Set GEMINI_API_KEY environment variable before running.")

    # Load challenges
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    # Support both {"challenges": [...]} and [...]
    if isinstance(data, dict):
        challenges = data["challenges"]
        wrap = True
    else:
        challenges = data
        wrap = False

    # Filter to requested IDs
    if args.ids:
        targets = [c for c in challenges if c["id"] in args.ids]
    else:
        targets = challenges

    # Skip already-enriched unless --force
    if not args.force:
        targets = [c for c in targets if "background" not in c or not isinstance(c.get("background"), dict) or "objective" not in c["background"]]

    if not targets:
        print("No challenges to enrich. All already have background data. Use --force to re-enrich.")
        return

    print(f"Enriching {len(targets)} challenge(s)...")

    if args.dry_run:
        for c in targets:
            print(f"\n{'='*60}")
            print(f"ID: {c['id']}")
            print(build_prompt(c))
        return

    client = genai.Client(api_key=api_key)

    success_count = 0
    fail_count = 0
    failed_ids = []

    # Build a lookup to update challenges in-place
    challenges_by_id = {c["id"]: c for c in challenges}

    for i, challenge in enumerate(targets):
        cid = challenge["id"]
        print(f"[{i+1}/{len(targets)}] Enriching: {cid}...", end=" ", flush=True)
        try:
            enrich_challenge(challenge, client)
            challenges_by_id[cid].update(challenge)
            success_count += 1
            print("OK")
            # Checkpoint: write after every success so progress isn't lost on crash
            out_path = Path(args.out)
            output_data = {"challenges": challenges} if wrap else challenges
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            fail_count += 1
            failed_ids.append(cid)
            print(f"FAILED — {e}")

        if i < len(targets) - 1:
            time.sleep(4.5)  # free tier: 15 RPM → need >4s between calls

    # Final write
    out_path = Path(args.out)
    output_data = {"challenges": challenges} if wrap else challenges
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*40}")
    print(f"Done. Enriched: {success_count}  Failed: {fail_count}")
    if failed_ids:
        print(f"Failed IDs: {', '.join(failed_ids)}")

    # Pillar summary
    pillar_counts: dict = {}
    for c in challenges:
        if "background" in c and isinstance(c.get("background"), dict) and "objective" in c["background"]:
            pillar = c.get("pillar", "unknown")
            pillar_counts[pillar] = pillar_counts.get(pillar, 0) + 1
    print("\nEnriched challenges per pillar:")
    for pillar, count in sorted(pillar_counts.items()):
        print(f"  {pillar}: {count}")

    print(f"\nOutput written to: {out_path}")


if __name__ == "__main__":
    main()
