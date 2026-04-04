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
        summary: str,
        errors: list[str],
        warnings: list[str],
        suggestions: list[str],
        encouragement: str
    }
    """
    total = score_breakdown.get("total", 0)
    errors = []
    warnings = []
    suggestions = []

    error_templates = templates.get("errors", {})
    warning_templates = templates.get("warnings", {})
    suggestion_templates = templates.get("suggestions", {})

    # Build human-readable block name helper
    def block_label(block_id: str) -> str:
        block = blocks_by_id.get(block_id, {})
        return block.get("label", block_id.replace("_", " ").title())

    for vr in validation_results:
        if vr["passed"]:
            continue

        rule = vr.get("rule", "")
        severity = vr.get("severity", "warning")

        if rule == "analysis_data_compatible":
            # Find analysis and data block ids
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
                msg = tmpl.format(
                    analysis=block_label(a_id),
                    data_type=actual_type,
                    required_type=required_type,
                )
                errors.append(msg)

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
                msg = tmpl.format(
                    method=block_label(m_id),
                    expected_type=expected_type,
                    actual_type=actual_type,
                )
                errors.append(msg)

        elif rule == "method_requires_control":
            errors.append(
                error_templates.get("missing_control_variable", vr["message"])
            )

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

    # Suggestions based on rigor_detail
    rigor = score_breakdown.get("breakdown", {}).get("rigor_detail", {})
    if not rigor.get("control_variable"):
        suggestions.append(suggestion_templates.get("add_control", "Add a Control Variable to isolate the effect of your independent variable."))
    if not rigor.get("adequate_sample"):
        suggestions.append(suggestion_templates.get("increase_sample", "Consider a larger sample size for more reliable results."))
    if not rigor.get("rigorous_sampling"):
        suggestions.append(suggestion_templates.get("better_sampling", "Random or stratified sampling would improve the validity of your findings."))

    # Score tier
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

    return {
        "summary": summary,
        "errors": errors,
        "warnings": warnings,
        "suggestions": suggestions,
        "encouragement": encouragement,
    }
