import io
import json
import os
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional
from urllib.request import urlopen

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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
    summary_fields = [
        "id", "title", "difficulty", "level", "description", "tags",
        "pillar", "subtopic", "type", "arxiv_id",
        "available_categories", "hints", "brief", "broken_canvas",
        "background",
    ]
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
        "rubric_results": feedback.get("rubric_results"),
        "ideal_comparison": feedback.get("ideal_comparison"),
        "common_mistakes_triggered": feedback.get("common_mistakes_triggered", []),
        "validation_results": validation_results,
        "is_valid": is_valid,
    }


# ---- Generate Lab (paper → custom challenge) ----

_gemini_client = None


def _get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        try:
            from google import genai
        except ImportError:
            raise HTTPException(503, "google-genai not installed. Run: python -m pip install google-genai")
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise HTTPException(503, "GEMINI_API_KEY environment variable is not set on the server.")
        _gemini_client = genai.Client(api_key=key)
    return _gemini_client


def _extract_pdf_text(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        raise HTTPException(503, "pypdf not installed. Run: python -m pip install pypdf")
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages[:20]]
    return "\n\n".join(pages)


def _fetch_arxiv_text(arxiv_id: str) -> str:
    arxiv_id = arxiv_id.strip()
    url = f"https://export.arxiv.org/api/query?id_list={arxiv_id}"
    try:
        with urlopen(url, timeout=10) as resp:
            xml_bytes = resp.read()
    except Exception as e:
        raise HTTPException(502, f"Failed to fetch arXiv metadata: {e}")
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(xml_bytes)
    entry = root.find("atom:entry", ns)
    if entry is None:
        raise HTTPException(404, f"arXiv paper '{arxiv_id}' not found.")
    title = (entry.findtext("atom:title", "", ns) or "").strip().replace("\n", " ")
    summary = (entry.findtext("atom:summary", "", ns) or "").strip().replace("\n", " ")
    if not summary:
        raise HTTPException(404, f"arXiv paper '{arxiv_id}' returned no abstract.")
    return f"{title}\n\n{summary}"


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1]).strip()
    return json.loads(text)


_GENERATE_PROMPT = """\
You are a research methodology professor creating a teaching exercise.

Given this research paper (title + abstract or full text):
---
{paper_text}
---

Create a ReScratch challenge that teaches students how to design the methodology for this research.

Return a JSON object with EXACTLY these keys (no extra keys, no markdown, no explanation):

{{
  "title": "A concise research question from this paper (≤12 words, ends with ?)",
  "description": "2-3 sentence scenario describing what the paper is investigating and why.",
  "difficulty": "beginner|intermediate|advanced|expert",
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": ["Hint 1 about methodology choice", "Hint 2 about variables", "Hint 3 about analysis"],
  "tags": ["2-5 lowercase tags like experiment, quantitative, deep-learning"],
  "pillar": "technology|mathematics|engineering|science|social",
  "subtopic": "machine_learning|computer_vision|nlp|reinforcement_learning|cybersecurity_crypto|pure_math|applied_math_finance|statistics|electrical_computer|mechanical_aerospace|biology_chemistry|physics|psychology|economics|sociology",
  "background": {{
    "objective": "2-3 sentences: what this research discovers and why it matters.",
    "context": "3-4 sentences of background knowledge the student needs.",
    "task": "1-2 sentences telling the student exactly what to do.",
    "constraints": ["2-4 specific constraints"],
    "key_terms": [{{"term": "string", "definition": "1 sentence"}}]
  }},
  "ideal_pipeline": {{
    "hypothesis_type": "directional_increase|directional_decrease|nondirectional|null",
    "independent_variable": "string",
    "dependent_variable": "string",
    "control_variables": ["string"],
    "confounding_variables": ["string"],
    "method": "method_experiment_lab|method_experiment_field|method_survey|method_observational|method_case_study|method_meta_analysis|method_simulation|method_ablation|method_rct|method_longitudinal|method_monte_carlo",
    "sample_size": "small|medium|large",
    "sampling_method": "random|stratified|convenience|snowball",
    "data_collection": "best data collection block ID",
    "analysis": "analysis_ttest|analysis_anova|analysis_regression|analysis_chi_square|analysis_correlation|analysis_descriptive|analysis_thematic|analysis_time_series",
    "explanation": "2-3 sentences explaining why this is the ideal methodology."
  }},
  "common_mistakes": [
    {{"mistake": "description", "why_wrong": "1 sentence", "better_choice": "what to do instead"}},
    {{"mistake": "...", "why_wrong": "...", "better_choice": "..."}},
    {{"mistake": "...", "why_wrong": "...", "better_choice": "..."}}
  ],
  "grading_rubric": {{
    "must_have": ["required block choices for full marks"],
    "bonus": ["extras that earn rigor points"],
    "penalties": ["mistakes that lose points"]
  }}
}}

Return ONLY valid JSON. No markdown code fences. No explanation outside the JSON."""


@app.post("/api/generate-lab")
async def generate_lab(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    arxiv_id: Optional[str] = Form(None),
):
    """Generate a custom challenge from a PDF upload, pasted text, or arXiv ID."""
    provided = sum([file is not None, bool(text and text.strip()), bool(arxiv_id and arxiv_id.strip())])
    if provided == 0:
        raise HTTPException(400, "Provide one of: file (PDF), text, or arxiv_id.")
    if provided > 1:
        raise HTTPException(400, "Provide only one of: file, text, or arxiv_id.")

    # Extract paper text
    if file is not None:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are supported.")
        file_bytes = await file.read()
        paper_text = _extract_pdf_text(file_bytes)
    elif arxiv_id and arxiv_id.strip():
        paper_text = _fetch_arxiv_text(arxiv_id.strip())
    else:
        paper_text = text.strip()

    if not paper_text:
        raise HTTPException(400, "Could not extract any text from the provided input.")

    # Call Gemini
    client = _get_gemini_client()
    prompt = _GENERATE_PROMPT.format(paper_text=paper_text[:4000])
    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        challenge = _parse_json_response(response.text)
    except json.JSONDecodeError as e:
        raise HTTPException(502, f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(502, f"Gemini API error: {e}")

    # Assign ID and register in memory
    challenge_id = f"custom_{uuid.uuid4().hex[:8]}"
    challenge["id"] = challenge_id
    challenge["level"] = 999
    challenge["type"] = "custom"
    challenges_by_id[challenge_id] = challenge

    return challenge
