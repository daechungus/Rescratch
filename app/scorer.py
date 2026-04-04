def score_pipeline(pipeline: dict, validation_results: list, blocks_by_id: dict) -> dict:
    """
    Returns {
        completeness: int (0-35),
        logical_coherence: int (0-35),
        methodological_rigor: int (0-30),
        total: int (0-100),
        breakdown: dict
    }
    """
    # --- Completeness (0-35) ---
    # 7 categories × 5 pts each = 35
    category_points = {
        "HYPOTHESIS": 5,
        "VARIABLE": 5,
        "METHOD": 5,
        "SAMPLE": 5,
        "DATA_COLLECTION": 5,
        "ANALYSIS": 5,
        "CONCLUSION": 5,
    }

    completeness = 0
    completeness_detail = {}
    for cat, pts in category_points.items():
        has_block = len(pipeline.get(cat, [])) > 0
        earned = pts if has_block else 0
        completeness += earned
        completeness_detail[cat] = {"earned": earned, "max": pts, "has_block": has_block}

    # --- Logical Coherence (0-35) ---
    # Start at 35, deduct for failures
    coherence = 35
    coherence_detail = {"deductions": []}

    for vr in validation_results:
        if vr["passed"]:
            continue
        severity = vr.get("severity", "warning")
        rule = vr.get("rule", "")

        # Missing category blocks are handled in completeness; skip here
        if rule.startswith("has_") and rule != "has_confounding_variable":
            continue

        if severity == "error":
            deduction = 10
        elif severity == "warning":
            deduction = 5
        else:
            deduction = 0

        if deduction > 0:
            coherence -= deduction
            coherence_detail["deductions"].append({
                "rule": rule,
                "deduction": deduction,
                "message": vr["message"],
            })

    coherence = max(0, coherence)

    # --- Methodological Rigor (0-30) ---
    rigor = 0
    rigor_detail = {}

    variable_blocks = pipeline.get("VARIABLE", [])
    variable_ids = [b if isinstance(b, str) else b.get("id", "") for b in variable_blocks]

    sample_blocks = pipeline.get("SAMPLE", [])
    sample_ids = [b if isinstance(b, str) else b.get("id", "") for b in sample_blocks]

    analysis_blocks = pipeline.get("ANALYSIS", [])
    analysis_ids = [b if isinstance(b, str) else b.get("id", "") for b in analysis_blocks]

    method_blocks = pipeline.get("METHOD", [])
    method_ids = [b if isinstance(b, str) else b.get("id", "") for b in method_blocks]

    # +6 for control variable
    has_control = "control_variable" in variable_ids
    rigor_detail["control_variable"] = has_control
    if has_control:
        rigor += 6

    # +6 for medium or large sample
    has_adequate_sample = "sample_medium" in sample_ids or "sample_large" in sample_ids
    rigor_detail["adequate_sample"] = has_adequate_sample
    if has_adequate_sample:
        rigor += 6

    # +6 for random or stratified sampling
    has_rigorous_sampling = "sampling_random" in sample_ids or "sampling_stratified" in sample_ids
    rigor_detail["rigorous_sampling"] = has_rigorous_sampling
    if has_rigorous_sampling:
        rigor += 6

    # +6 for identifying confounding variable
    has_confounding = "confounding_variable" in variable_ids
    rigor_detail["confounding_identified"] = has_confounding
    if has_confounding:
        rigor += 6

    # +6 for using a complex analysis method (regression or anova)
    uses_complex_analysis = any(
        aid in ("analysis_regression", "analysis_anova") for aid in analysis_ids
    )
    rigor_detail["complex_analysis"] = uses_complex_analysis
    if uses_complex_analysis:
        rigor += 6

    total = completeness + coherence + rigor

    return {
        "completeness": completeness,
        "logical_coherence": coherence,
        "methodological_rigor": rigor,
        "total": total,
        "breakdown": {
            "completeness_detail": completeness_detail,
            "coherence_detail": coherence_detail,
            "rigor_detail": rigor_detail,
        },
    }
