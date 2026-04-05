# Block compatibility rules — pure functions, stdlib only

ANALYSIS_DATA_COMPATIBILITY = {
    "t_test": ["quantitative"],
    "anova": ["quantitative"],
    "chi_square": ["quantitative"],
    "regression": ["quantitative"],
    "correlation": ["quantitative"],
    "thematic_analysis": ["qualitative"],
    "content_analysis": ["qualitative", "mixed"],
}

METHOD_DATA_COMPATIBILITY = {
    "survey": ["quantitative", "qualitative", "mixed"],
    "experiment_lab": ["quantitative"],
    "experiment_field": ["quantitative", "mixed"],
    "observational": ["qualitative", "mixed"],
    "case_study": ["qualitative"],
    "meta_analysis": ["quantitative", "mixed"],
}

METHOD_REQUIRES_CONTROL = ["experiment_lab", "experiment_field"]


def _get_analysis_key(block_id: str) -> str:
    """Strip the 'analysis_' prefix to get the analysis method key."""
    return block_id.replace("analysis_", "")


def _get_method_key(block_id: str) -> str:
    """Strip the 'method_' prefix to get the method key."""
    return block_id.replace("method_", "")


def check_analysis_data_compatible(analysis_block_id: str, data_block_id: str) -> tuple:
    """
    Returns (is_compatible, reason).
    Checks whether the analysis method is appropriate for the data collection type.
    """
    analysis_key = _get_analysis_key(analysis_block_id)

    # Determine data type from data_block_id
    if data_block_id in ("data_likert", "data_measurement", "data_count"):
        data_type = "quantitative"
    elif data_block_id in ("data_interview", "data_open_ended", "data_observation_notes"):
        data_type = "qualitative"
    elif data_block_id == "data_mixed":
        data_type = "mixed"
    else:
        # Unknown data block — assume compatible
        return True, "Data block type unknown; skipping compatibility check."

    compatible_types = ANALYSIS_DATA_COMPATIBILITY.get(analysis_key)
    if compatible_types is None:
        return True, f"Analysis '{analysis_key}' not in compatibility table; skipping check."

    if data_type in compatible_types:
        return True, f"{analysis_key} is compatible with {data_type} data."
    else:
        required = " or ".join(compatible_types)
        return (
            False,
            f"{analysis_key} requires {required} data, but you selected {data_type} collection tools.",
        )


def check_method_data_compatible(method_block_id: str, data_block_id: str) -> tuple:
    """
    Returns (is_compatible, reason).
    Checks whether the data collection approach fits the chosen method.
    """
    method_key = _get_method_key(method_block_id)

    # Determine data type from data_block_id
    if data_block_id in ("data_likert", "data_measurement", "data_count"):
        data_type = "quantitative"
    elif data_block_id in ("data_interview", "data_open_ended", "data_observation_notes"):
        data_type = "qualitative"
    elif data_block_id == "data_mixed":
        data_type = "mixed"
    else:
        return True, "Data block type unknown; skipping compatibility check."

    compatible_types = METHOD_DATA_COMPATIBILITY.get(method_key)
    if compatible_types is None:
        return True, f"Method '{method_key}' not in compatibility table; skipping check."

    if data_type in compatible_types:
        return True, f"{method_key} is compatible with {data_type} data."
    else:
        expected = " or ".join(compatible_types)
        return (
            False,
            f"A {method_key} study typically collects {expected} data, but you chose {data_type} collection tools.",
        )


def check_method_requires_control(method_block_id: str, variable_block_ids: list) -> tuple:
    """
    Returns (is_satisfied, reason).
    Experiments require at least one 'control_variable' block.
    """
    method_key = _get_method_key(method_block_id)

    if method_key not in METHOD_REQUIRES_CONTROL:
        return True, f"{method_key} does not require a control variable."

    has_control = "control_variable" in variable_block_ids
    if has_control:
        return True, "Control variable present — good experimental design."
    else:
        return (
            False,
            "Experiments require a control variable to isolate the effect of your independent variable.",
        )


def check_hypothesis_has_variables(hypothesis_block_id: str, variable_block_ids: list) -> tuple:
    """
    Returns (is_satisfied, reason).
    A hypothesis must be paired with at least an IV and DV.
    """
    has_iv = "independent_variable" in variable_block_ids
    has_dv = "dependent_variable" in variable_block_ids

    if has_iv and has_dv:
        return True, "Hypothesis has both IV and DV — well structured."
    elif not has_iv and not has_dv:
        return False, "Your hypothesis needs both an Independent Variable and a Dependent Variable."
    elif not has_iv:
        return False, "Your hypothesis needs an Independent Variable — what are you manipulating?"
    else:
        return False, "Your hypothesis needs a Dependent Variable — what are you measuring?"


def validate_pipeline(pipeline: dict, blocks_by_id: dict) -> list:
    """
    Runs all compatibility checks on the pipeline.
    Returns list of {rule, passed, message, severity} dicts.
    """
    results = []

    hypothesis_blocks = pipeline.get("HYPOTHESIS", [])
    variable_blocks = pipeline.get("VARIABLE", [])
    method_blocks = pipeline.get("METHOD", [])
    data_blocks = pipeline.get("DATA_COLLECTION", [])
    analysis_blocks = pipeline.get("ANALYSIS", [])
    sample_blocks = pipeline.get("SAMPLE", [])
    conclusion_blocks = pipeline.get("CONCLUSION", [])

    # Check all 7 categories have at least one block
    required_categories = [
        "HYPOTHESIS", "VARIABLE", "METHOD", "SAMPLE",
        "DATA_COLLECTION", "ANALYSIS", "CONCLUSION"
    ]
    for cat in required_categories:
        has_blocks = len(pipeline.get(cat, [])) > 0
        results.append({
            "rule": f"has_{cat.lower()}",
            "passed": has_blocks,
            "message": f"{'Has' if has_blocks else 'Missing'} {cat.replace('_', ' ').title()} block.",
            "severity": "warning" if not has_blocks else "info",
        })

    # Check hypothesis has IV and DV
    # Skip if any custom variable blocks are present — custom blocks may cover these roles
    has_custom_variable = any(str(b if isinstance(b, str) else b.get("id","")).startswith("custom_") for b in variable_blocks)

    if hypothesis_blocks and variable_blocks and not has_custom_variable:
        variable_ids = [b if isinstance(b, str) else b.get("id", "") for b in variable_blocks]
        passed, msg = check_hypothesis_has_variables(hypothesis_blocks[0], variable_ids)
        results.append({
            "rule": "hypothesis_has_iv_dv",
            "passed": passed,
            "message": msg,
            "severity": "error" if not passed else "info",
        })

    # Check method requires control variable
    if method_blocks and not has_custom_variable:
        method_id = method_blocks[0] if isinstance(method_blocks[0], str) else method_blocks[0].get("id", "")
        variable_ids = [b if isinstance(b, str) else b.get("id", "") for b in variable_blocks]
        passed, msg = check_method_requires_control(method_id, variable_ids)
        results.append({
            "rule": "method_requires_control",
            "passed": passed,
            "message": msg,
            "severity": "error" if not passed else "info",
        })

    # Check analysis/data compatibility
    if analysis_blocks and data_blocks:
        analysis_id = analysis_blocks[0] if isinstance(analysis_blocks[0], str) else analysis_blocks[0].get("id", "")
        data_id = data_blocks[0] if isinstance(data_blocks[0], str) else data_blocks[0].get("id", "")
        passed, msg = check_analysis_data_compatible(analysis_id, data_id)
        results.append({
            "rule": "analysis_data_compatible",
            "passed": passed,
            "message": msg,
            "severity": "error" if not passed else "info",
        })

    # Check method/data compatibility
    if method_blocks and data_blocks:
        method_id = method_blocks[0] if isinstance(method_blocks[0], str) else method_blocks[0].get("id", "")
        data_id = data_blocks[0] if isinstance(data_blocks[0], str) else data_blocks[0].get("id", "")
        passed, msg = check_method_data_compatible(method_id, data_id)
        results.append({
            "rule": "method_data_compatible",
            "passed": passed,
            "message": msg,
            "severity": "error" if not passed else "info",
        })

    # Check sample size warnings
    sample_ids = [b if isinstance(b, str) else b.get("id", "") for b in sample_blocks]
    has_small = "sample_small" in sample_ids
    has_random = "sampling_random" in sample_ids or "sampling_stratified" in sample_ids
    has_convenience = "sampling_convenience" in sample_ids or "sampling_snowball" in sample_ids

    if has_small:
        results.append({
            "rule": "adequate_sample_size",
            "passed": False,
            "message": "A small sample (<30) limits statistical power and generalizability.",
            "severity": "warning",
        })

    if has_convenience:
        results.append({
            "rule": "sampling_quality",
            "passed": False,
            "message": "Convenience sampling introduces selection bias — consider random sampling.",
            "severity": "warning",
        })

    # Check for confounding variable (skip if custom variables present)
    variable_ids = [b if isinstance(b, str) else b.get("id", "") for b in variable_blocks]
    has_confounding = "confounding_variable" in variable_ids
    if not has_custom_variable:
        if not has_confounding:
            results.append({
                "rule": "has_confounding_variable",
                "passed": False,
                "message": "Consider identifying potential confounding variables to strengthen your design.",
                "severity": "warning",
            })
        else:
            results.append({
                "rule": "has_confounding_variable",
                "passed": True,
                "message": "Confounding variable identified — rigorous design.",
                "severity": "info",
            })
    elif has_confounding:
        results.append({
            "rule": "has_confounding_variable",
            "passed": True,
            "message": "Confounding variable identified — rigorous design.",
            "severity": "info",
        })

    return results
