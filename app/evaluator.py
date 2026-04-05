def generate_feedback(
    pipeline: dict,
    validation_results: list,
    score_breakdown: dict,
    challenge: dict,
    blocks_by_id: dict,
    templates: dict,
) -> dict:
    """
    Returns {
        summary, errors, warnings, suggestions, encouragement,
        rubric_results, ideal_comparison, common_mistakes_triggered
    }
    """
    total = score_breakdown.get("total", 0)
    errors = []
    warnings = []
    suggestions = []

    error_templates = templates.get("errors", {})
    warning_templates = templates.get("warnings", {})
    suggestion_templates = templates.get("suggestions", {})

    def block_label(block_id: str) -> str:
        block = blocks_by_id.get(block_id, {})
        return block.get("label", block_id.replace("_", " ").title())

    for vr in validation_results:
        if vr["passed"]:
            continue

        rule = vr.get("rule", "")
        severity = vr.get("severity", "warning")

        if rule == "analysis_data_compatible":
            analysis_blocks = pipeline.get("ANALYSIS", [])
            data_blocks = pipeline.get("DATA_COLLECTION", [])
            if analysis_blocks and data_blocks:
                a_id = analysis_blocks[0] if isinstance(analysis_blocks[0], str) else analysis_blocks[0].get("id", "")
                d_id = data_blocks[0] if isinstance(data_blocks[0], str) else data_blocks[0].get("id", "")
                a_block = blocks_by_id.get(a_id, {})
                d_block = blocks_by_id.get(d_id, {})
                required_type = a_block.get("required_data_type", "appropriate")
                actual_type = d_block.get("data_type", "unknown")
                tmpl = error_templates.get("analysis_data_mismatch", vr["message"])
                errors.append(tmpl.format(
                    analysis=block_label(a_id),
                    data_type=actual_type,
                    required_type=required_type,
                ))

        elif rule == "method_data_compatible":
            method_blocks = pipeline.get("METHOD", [])
            data_blocks = pipeline.get("DATA_COLLECTION", [])
            if method_blocks and data_blocks:
                m_id = method_blocks[0] if isinstance(method_blocks[0], str) else method_blocks[0].get("id", "")
                d_id = data_blocks[0] if isinstance(data_blocks[0], str) else data_blocks[0].get("id", "")
                m_block = blocks_by_id.get(m_id, {})
                d_block = blocks_by_id.get(d_id, {})
                expected_type = m_block.get("data_type", "appropriate")
                actual_type = d_block.get("data_type", "unknown")
                tmpl = error_templates.get("method_data_mismatch", vr["message"])
                errors.append(tmpl.format(
                    method=block_label(m_id),
                    expected_type=expected_type,
                    actual_type=actual_type,
                ))

        elif rule == "method_requires_control":
            errors.append(error_templates.get("missing_control_variable", vr["message"]))

        elif rule == "hypothesis_has_iv_dv":
            msg = vr["message"]
            if "Independent Variable" in msg and "Dependent Variable" in msg:
                errors.append(error_templates.get("missing_iv", msg))
                errors.append(error_templates.get("missing_dv", msg))
            elif "Independent Variable" in msg:
                errors.append(error_templates.get("missing_iv", msg))
            else:
                errors.append(error_templates.get("missing_dv", msg))

        elif rule.startswith("has_") and not vr["passed"]:
            cat = rule.replace("has_", "").upper()
            tmpl = error_templates.get("missing_category", "You haven't placed a {category} block yet.")
            warnings.append(tmpl.format(category=cat.replace("_", " ").title()))

        elif rule == "adequate_sample_size":
            warnings.append(warning_templates.get("small_sample", vr["message"]))

        elif rule == "sampling_quality":
            warnings.append(warning_templates.get("convenience_sampling", vr["message"]))

        elif rule == "has_confounding_variable" and not vr["passed"]:
            warnings.append(warning_templates.get("no_confounding", vr["message"]))

    rigor = score_breakdown.get("breakdown", {}).get("rigor_detail", {})
    if not rigor.get("control_variable"):
        suggestions.append(suggestion_templates.get("add_control", "Add a Control Variable to isolate the effect of your independent variable."))
    if not rigor.get("adequate_sample"):
        suggestions.append(suggestion_templates.get("increase_sample", "Consider a larger sample size for more reliable results."))
    if not rigor.get("rigorous_sampling"):
        suggestions.append(suggestion_templates.get("better_sampling", "Random or stratified sampling would improve the validity of your findings."))

    score_tiers = templates.get("score_tiers", {})
    if total >= 70:
        tier_key = "excellent"
    elif total >= 50:
        tier_key = "good"
    elif total >= 30:
        tier_key = "needs_work"
    else:
        tier_key = "restart"

    tier_messages = score_tiers.get(tier_key, ["Keep working on your methodology!"])
    summary = tier_messages[0] if tier_messages else "Keep working on your methodology!"
    encouragement = tier_messages[1] if len(tier_messages) > 1 else summary

    # ── Rubric, ideal comparison, common mistakes (only if enriched) ──────────
    rubric_results = _check_rubric(pipeline, blocks_by_id, challenge.get("grading_rubric"), validation_results)
    ideal_comparison = _check_ideal(pipeline, challenge.get("ideal_pipeline"))
    common_mistakes_triggered = _check_common_mistakes(pipeline, blocks_by_id, challenge.get("common_mistakes"), validation_results)

    return {
        "summary": summary,
        "errors": errors,
        "warnings": warnings,
        "suggestions": suggestions,
        "encouragement": encouragement,
        "rubric_results": rubric_results,
        "ideal_comparison": ideal_comparison,
        "common_mistakes_triggered": common_mistakes_triggered,
    }


# ── Rubric checking ────────────────────────────────────────────────────────────

def _check_rubric(pipeline: dict, blocks_by_id: dict, rubric: dict | None, validation_results: list) -> dict | None:
    if not rubric:
        return None

    failed_rules = {vr["rule"] for vr in validation_results if not vr["passed"]}

    met = []
    missed = []
    bonuses = []
    penalties = []

    for item in rubric.get("must_have", []):
        if _rubric_condition_satisfied(item, pipeline, blocks_by_id, failed_rules):
            met.append(item)
        else:
            missed.append(item)

    for item in rubric.get("bonus", []):
        if _rubric_condition_satisfied(item, pipeline, blocks_by_id, failed_rules):
            bonuses.append(item)

    for item in rubric.get("penalties", []):
        if _penalty_triggered(item, pipeline, blocks_by_id, failed_rules):
            penalties.append(item)

    return {"met": met, "missed": missed, "bonuses": bonuses, "penalties": penalties}


def _rubric_condition_satisfied(text: str, pipeline: dict, blocks_by_id: dict, failed_rules: set) -> bool:
    """Keyword-based heuristic: does the pipeline satisfy this rubric item?"""
    t = text.lower()

    var_ids = pipeline.get("VARIABLE", [])
    sample_ids = pipeline.get("SAMPLE", [])
    method_ids = pipeline.get("METHOD", [])
    analysis_ids = pipeline.get("ANALYSIS", [])
    data_ids = pipeline.get("DATA_COLLECTION", [])

    def data_type_of(bid: str) -> str:
        return blocks_by_id.get(bid, {}).get("data_type", "").lower()

    if "control variable" in t:
        return "control_variable" in var_ids

    if "confound" in t:
        return "confounding_variable" in var_ids

    if "random sampl" in t:
        return "sampling_random" in sample_ids

    if "stratified" in t and "sampl" in t:
        return "sampling_stratified" in sample_ids

    if ("large sample" in t or "adequate sample" in t or "sufficient sample" in t
            or "sample size" in t and "enough" in t):
        return "sample_large" in sample_ids or "sample_medium" in sample_ids

    if "quantitative" in t and ("data" in t or "collection" in t or "measurement" in t):
        return any(data_type_of(b) in ("quantitative", "numeric", "numerical") for b in data_ids)

    if "regression" in t and "analysis" in t:
        return "analysis_regression" in analysis_ids

    if "anova" in t:
        return "analysis_anova" in analysis_ids

    if "t-test" in t or "t test" in t:
        return "analysis_ttest" in analysis_ids

    if "chi-square" in t or "chi square" in t:
        return any("chi" in a for a in analysis_ids)

    if ("lab experiment" in t or "controlled experiment" in t
            or ("experiment" in t and "method" in t)):
        return any("experiment" in m for m in method_ids)

    if "field experiment" in t:
        return "method_experiment_field" in method_ids

    if "rct" in t or "randomized controlled trial" in t:
        return "method_rct" in method_ids

    if "double-blind" in t or "double blind" in t:
        return "method_double_blind" in method_ids

    if "survey" in t and "method" in t:
        return "method_survey" in method_ids

    if "conclusion" in t:
        return len(pipeline.get("CONCLUSION", [])) > 0

    if "hypothesis" in t:
        return len(pipeline.get("HYPOTHESIS", [])) > 0

    # Unknown item — fall back to checking if no validation errors exist
    return len(failed_rules) == 0


def _penalty_triggered(text: str, pipeline: dict, blocks_by_id: dict, failed_rules: set) -> bool:
    """Returns True if the player made this mistake."""
    t = text.lower()

    var_ids = pipeline.get("VARIABLE", [])
    sample_ids = pipeline.get("SAMPLE", [])
    analysis_ids = pipeline.get("ANALYSIS", [])
    data_ids = pipeline.get("DATA_COLLECTION", [])

    def data_type_of(bid: str) -> str:
        return blocks_by_id.get(bid, {}).get("data_type", "").lower()

    # Type mismatches
    if ("qualitative analysis" in t or "qualitative" in t and "quantitative" in t):
        return ("analysis_data_compatible" in failed_rules
                or "method_data_compatible" in failed_rules)

    # Small sample
    if "small sample" in t or "too small" in t or "insufficient sample" in t:
        return "sample_small" in sample_ids

    # Missing control
    if "missing control" in t or "no control" in t or "without control" in t:
        return "control_variable" not in var_ids

    # Convenience sampling
    if "convenience sampl" in t:
        return "sampling_convenience" in sample_ids

    # Wrong analysis for multiple groups
    if "multiple group" in t or "more than two" in t:
        return "analysis_ttest" in analysis_ids  # t-test is wrong for 3+ groups

    # Missing confounding variable
    if "ignoring confound" in t or "no confound" in t:
        return "confounding_variable" not in var_ids

    return False


# ── Ideal pipeline comparison ─────────────────────────────────────────────────

def _check_ideal(pipeline: dict, ideal: dict | None) -> dict | None:
    if not ideal:
        return None

    method_ids = pipeline.get("METHOD", [])
    analysis_ids = pipeline.get("ANALYSIS", [])
    var_ids = pipeline.get("VARIABLE", [])

    ideal_method = ideal.get("method", "")
    ideal_analysis = ideal.get("analysis", "")

    method_match = (ideal_method in method_ids) if ideal_method else None
    analysis_match = (ideal_analysis in analysis_ids) if ideal_analysis else None

    # Check if player included the recommended control variables as blocks
    ideal_controls = ideal.get("control_variables", [])
    has_control = "control_variable" in var_ids
    variables_match = has_control if ideal_controls else None

    return {
        "method_match": method_match,
        "ideal_method": ideal_method,
        "player_method": method_ids[0] if method_ids else None,
        "analysis_match": analysis_match,
        "ideal_analysis": ideal_analysis,
        "player_analysis": analysis_ids[0] if analysis_ids else None,
        "variables_match": variables_match,
        "explanation": ideal.get("explanation", ""),
    }


# ── Common mistakes detection ─────────────────────────────────────────────────

def _check_common_mistakes(
    pipeline: dict,
    blocks_by_id: dict,
    common_mistakes: list | None,
    validation_results: list,
) -> list:
    if not common_mistakes:
        return []

    failed_rules = {vr["rule"] for vr in validation_results if not vr["passed"]}
    triggered = []

    for mistake in common_mistakes:
        text = mistake.get("mistake", "").lower()

        # Qualitative/quantitative mismatch
        if "qualitative" in text or "wrong analysis" in text or "wrong method" in text:
            if failed_rules & {"analysis_data_compatible", "method_data_compatible"}:
                triggered.append(mistake)
                continue

        # Missing control
        if "control" in text and ("miss" in text or "no " in text or "without" in text or "forget" in text):
            if "method_requires_control" in failed_rules or "control_variable" not in pipeline.get("VARIABLE", []):
                triggered.append(mistake)
                continue

        # Small sample
        if "small sample" in text or "sample size" in text:
            if "sample_small" in pipeline.get("SAMPLE", []):
                triggered.append(mistake)
                continue

        # Convenience sampling
        if "convenience" in text:
            if "sampling_convenience" in pipeline.get("SAMPLE", []):
                triggered.append(mistake)
                continue

        # Wrong analysis for group count
        if "t-test" in text and ("multiple" in text or "groups" in text or "three" in text):
            if "analysis_ttest" in pipeline.get("ANALYSIS", []):
                triggered.append(mistake)
                continue

    return triggered
