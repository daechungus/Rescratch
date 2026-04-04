"""
Unit tests for block compatibility rules.
Run: pytest tests/test_compatibility.py -v
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.compatibility import (
    check_analysis_data_compatible,
    check_method_data_compatible,
    check_method_requires_control,
    check_hypothesis_has_variables,
    validate_pipeline,
)


# ---------------------------------------------------------------------------
# check_analysis_data_compatible
# ---------------------------------------------------------------------------

def test_valid_quantitative_analysis():
    ok, _ = check_analysis_data_compatible("analysis_t_test", "data_measurement")
    assert ok


def test_valid_qualitative_analysis():
    ok, _ = check_analysis_data_compatible("analysis_thematic", "data_interview")
    assert ok


def test_invalid_qualitative_analysis_on_quant_data():
    ok, msg = check_analysis_data_compatible("analysis_thematic", "data_measurement")
    assert not ok
    assert "quantitative" in msg.lower() or "thematic" in msg.lower()


def test_invalid_ttest_on_qualitative_data():
    ok, msg = check_analysis_data_compatible("analysis_t_test", "data_interview")
    assert not ok


def test_content_analysis_on_mixed_data():
    ok, _ = check_analysis_data_compatible("analysis_content", "data_mixed")
    assert ok


def test_unknown_analysis_passes():
    # Unknown IDs should not crash — pass through
    ok, _ = check_analysis_data_compatible("unknown_analysis", "data_measurement")
    assert ok


# ---------------------------------------------------------------------------
# check_method_data_compatible
# ---------------------------------------------------------------------------

def test_experiment_lab_quantitative():
    ok, _ = check_method_data_compatible("method_experiment_lab", "data_measurement")
    assert ok


def test_experiment_lab_qualitative_incompatible():
    ok, msg = check_method_data_compatible("method_experiment_lab", "data_interview")
    assert not ok


def test_survey_mixed_compatible():
    ok, _ = check_method_data_compatible("method_survey", "data_mixed")
    assert ok


def test_case_study_qualitative():
    ok, _ = check_method_data_compatible("method_case_study", "data_observation_notes")
    assert ok


# ---------------------------------------------------------------------------
# check_method_requires_control
# ---------------------------------------------------------------------------

def test_experiment_requires_control():
    ok, msg = check_method_requires_control(
        "method_experiment_lab",
        ["independent_variable", "dependent_variable"]
    )
    assert not ok
    assert "control" in msg.lower()


def test_experiment_with_control_passes():
    ok, _ = check_method_requires_control(
        "method_experiment_lab",
        ["independent_variable", "dependent_variable", "control_variable"]
    )
    assert ok


def test_survey_does_not_require_control():
    ok, _ = check_method_requires_control(
        "method_survey",
        ["independent_variable", "dependent_variable"]
    )
    assert ok


# ---------------------------------------------------------------------------
# check_hypothesis_has_variables
# ---------------------------------------------------------------------------

def test_hypothesis_needs_iv_and_dv():
    ok, msg = check_hypothesis_has_variables(
        "hypothesis_directional",
        ["control_variable"]
    )
    assert not ok


def test_hypothesis_with_iv_and_dv():
    ok, _ = check_hypothesis_has_variables(
        "hypothesis_directional",
        ["independent_variable", "dependent_variable"]
    )
    assert ok


# ---------------------------------------------------------------------------
# validate_pipeline (integration)
# ---------------------------------------------------------------------------

BLOCKS_BY_ID = {
    "hypothesis_directional": {"id": "hypothesis_directional", "category": "HYPOTHESIS"},
    "independent_variable": {"id": "independent_variable", "category": "VARIABLE"},
    "dependent_variable": {"id": "dependent_variable", "category": "VARIABLE"},
    "control_variable": {"id": "control_variable", "category": "VARIABLE"},
    "method_experiment_lab": {
        "id": "method_experiment_lab",
        "category": "METHOD",
        "data_type": "quantitative",
        "requires_control": True,
    },
    "sample_medium": {"id": "sample_medium", "category": "SAMPLE", "size": "medium"},
    "sampling_random": {"id": "sampling_random", "category": "SAMPLE", "sampling_type": "random"},
    "data_measurement": {"id": "data_measurement", "category": "DATA_COLLECTION", "data_type": "quantitative"},
    "analysis_t_test": {
        "id": "analysis_t_test",
        "category": "ANALYSIS",
        "required_data_type": "quantitative",
    },
    "conclusion_supports": {"id": "conclusion_supports", "category": "CONCLUSION"},
}


def test_full_valid_pipeline():
    pipeline = {
        "HYPOTHESIS": ["hypothesis_directional"],
        "VARIABLE": ["independent_variable", "dependent_variable", "control_variable"],
        "METHOD": ["method_experiment_lab"],
        "SAMPLE": ["sample_medium", "sampling_random"],
        "DATA_COLLECTION": ["data_measurement"],
        "ANALYSIS": ["analysis_t_test"],
        "CONCLUSION": ["conclusion_supports"],
    }
    results = validate_pipeline(pipeline, BLOCKS_BY_ID)
    errors = [r for r in results if not r["passed"] and r.get("severity") == "error"]
    assert len(errors) == 0


def test_pipeline_missing_control_is_error():
    pipeline = {
        "HYPOTHESIS": ["hypothesis_directional"],
        "VARIABLE": ["independent_variable", "dependent_variable"],  # no control
        "METHOD": ["method_experiment_lab"],
        "SAMPLE": ["sample_medium", "sampling_random"],
        "DATA_COLLECTION": ["data_measurement"],
        "ANALYSIS": ["analysis_t_test"],
        "CONCLUSION": ["conclusion_supports"],
    }
    results = validate_pipeline(pipeline, BLOCKS_BY_ID)
    errors = [r for r in results if not r["passed"] and r.get("severity") == "error"]
    assert any("control" in r["message"].lower() for r in errors)
