"""
Quick smoke test for the scoring system.
Run from project root: python scripts/test_scorer.py
"""
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.challenges import load_blocks, load_challenges, load_templates
from app.compatibility import validate_pipeline
from app.scorer import score_pipeline
from app.evaluator import generate_feedback

DATA_DIR = Path(__file__).parent.parent / "data"

blocks_by_id = load_blocks(DATA_DIR)
challenges_by_id = load_challenges(DATA_DIR)
templates = load_templates(DATA_DIR)


def run_test(name: str, challenge_id: str, pipeline: dict):
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}")

    challenge = challenges_by_id.get(challenge_id)
    if not challenge:
        print(f"  ERROR: challenge '{challenge_id}' not found")
        return

    validation_results = validate_pipeline(pipeline, blocks_by_id)
    score_data = score_pipeline(pipeline, validation_results, blocks_by_id)
    feedback = generate_feedback(pipeline, validation_results, score_data, challenge, blocks_by_id, templates)

    print(f"  Score:          {score_data['total']}/85")
    print(f"  Completeness:   {score_data['completeness']}/30")
    print(f"  Coherence:      {score_data['logical_coherence']}/30")
    print(f"  Rigor:          {score_data['methodological_rigor']}/25")
    print(f"  Summary:        {feedback['summary']}")

    if feedback['errors']:
        print("  Errors:")
        for e in feedback['errors']:
            print(f"    [X] {e}")

    if feedback['warnings']:
        print("  Warnings:")
        for w in feedback['warnings']:
            print(f"    [!] {w}")

    if feedback['suggestions']:
        print("  Suggestions:")
        for s in feedback['suggestions']:
            print(f"    [>] {s}")


# Test 1: Perfect data augmentation pipeline
run_test(
    "Perfect data augmentation pipeline",
    "data_augmentation_accuracy",
    {
        "HYPOTHESIS": ["hypothesis_directional"],
        "VARIABLE": ["independent_variable", "dependent_variable", "control_variable", "confounding_variable"],
        "METHOD": ["method_experiment_lab"],
        "SAMPLE": ["sample_medium", "sampling_random"],
        "DATA_COLLECTION": ["data_measurement"],
        "ANALYSIS": ["analysis_t_test"],
        "CONCLUSION": ["conclusion_supports"],
    },
)

# Test 2: Missing analysis block
run_test(
    "Missing analysis block",
    "data_augmentation_accuracy",
    {
        "HYPOTHESIS": ["hypothesis_directional"],
        "VARIABLE": ["independent_variable", "dependent_variable"],
        "METHOD": ["method_experiment_lab"],
        "SAMPLE": ["sample_small", "sampling_convenience"],
        "DATA_COLLECTION": ["data_measurement"],
        "ANALYSIS": [],
        "CONCLUSION": ["conclusion_supports"],
    },
)

# Test 3: Analysis / data type mismatch
run_test(
    "Analysis/data type mismatch (t-test on qualitative data)",
    "rlhf_alignment_quality",
    {
        "HYPOTHESIS": ["hypothesis_nondirectional"],
        "VARIABLE": ["independent_variable", "dependent_variable"],
        "METHOD": ["method_survey"],
        "SAMPLE": ["sample_medium", "sampling_convenience"],
        "DATA_COLLECTION": ["data_interview"],
        "ANALYSIS": ["analysis_t_test"],
        "CONCLUSION": ["conclusion_inconclusive"],
    },
)

# Test 4: Empty pipeline
run_test(
    "Empty pipeline",
    "data_augmentation_accuracy",
    {
        "HYPOTHESIS": [],
        "VARIABLE": [],
        "METHOD": [],
        "SAMPLE": [],
        "DATA_COLLECTION": [],
        "ANALYSIS": [],
        "CONCLUSION": [],
    },
)

print("\nDone.")
