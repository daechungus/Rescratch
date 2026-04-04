from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.challenges import load_blocks, load_challenges, load_templates
from app.compatibility import validate_pipeline
from app.evaluator import generate_feedback
from app.scorer import score_pipeline

DATA_DIR = Path(__file__).parent.parent / "data"

app = FastAPI(title="ReScratch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data at startup
challenges_by_id: dict = {}
blocks_by_id: dict = {}
templates: dict = {}


@app.on_event("startup")
async def startup_event():
    global challenges_by_id, blocks_by_id, templates
    challenges_by_id = load_challenges(DATA_DIR)
    blocks_by_id = load_blocks(DATA_DIR)
    templates = load_templates(DATA_DIR)


# ---- Models ----

class PipelinePayload(BaseModel):
    challenge_id: str
    pipeline: dict  # {category: [block_id, ...]}


# ---- Routes ----

@app.get("/api/challenges")
def list_challenges():
    """Return list of all challenges (summary)."""
    summary_fields = ["id", "title", "difficulty", "level", "description", "tags", "pillar", "subtopic", "type"]
    result = []
    for c in challenges_by_id.values():
        result.append({k: c[k] for k in summary_fields if k in c})
    # Sort by level
    result.sort(key=lambda x: x.get("level", 999))
    return result


@app.get("/api/challenges/{challenge_id}")
def get_challenge(challenge_id: str):
    """Return full challenge object."""
    challenge = challenges_by_id.get(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail=f"Challenge '{challenge_id}' not found.")
    return challenge


@app.get("/api/blocks")
def list_blocks():
    """Return all block definitions."""
    return list(blocks_by_id.values())


@app.post("/api/evaluate")
def evaluate(payload: PipelinePayload):
    """
    Evaluate a submitted pipeline.
    Returns {score, breakdown, feedback, errors, is_valid}
    """
    challenge = challenges_by_id.get(payload.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail=f"Challenge '{payload.challenge_id}' not found.")

    pipeline = payload.pipeline

    # Validate pipeline
    validation_results = validate_pipeline(pipeline, blocks_by_id)

    # Score
    score_data = score_pipeline(pipeline, validation_results, blocks_by_id)

    # Generate feedback
    feedback = generate_feedback(
        pipeline, validation_results, score_data, challenge, blocks_by_id, templates
    )

    # Determine overall validity (no critical errors)
    critical_errors = [
        vr for vr in validation_results
        if not vr["passed"] and vr.get("severity") == "error"
    ]
    is_valid = len(critical_errors) == 0

    return {
        "score": score_data["total"],
        "breakdown": {
            "completeness": score_data["completeness"],
            "logical_coherence": score_data["logical_coherence"],
            "methodological_rigor": score_data["methodological_rigor"],
            "detail": score_data["breakdown"],
        },
        "feedback": feedback,
        "errors": feedback["errors"],
        "warnings": feedback["warnings"],
        "suggestions": feedback["suggestions"],
        "validation_results": validation_results,
        "is_valid": is_valid,
    }
