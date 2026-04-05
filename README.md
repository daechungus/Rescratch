# ReScratch

**A visual node-editor game for learning research methodology.**

Players design research pipelines by snapping blocks together on a free canvas — forming chains from Hypothesis through Variable, Method, Sample, Data Collection, Analysis, and Conclusion. A deterministic rule engine scores each submission across three dimensions and explains exactly why points were lost. No AI, no database, 100% rule-based.

---

## What it looks like

- **Hero page** — Three.js particle animation: 5,500 research-keyword word-sprites orbit a rotating sphere while 3,500 colored particles converge from all directions to spell "Rescratch"
- **Explore page** — Filter 159 challenges by discipline, topic, difficulty, or keyword
- **Lab** — Free-canvas node editor with draggable blocks, bezier connection lines, live validation badges, and a results panel that shows a score breakdown and AI-powered rubric feedback

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10 · FastAPI · Uvicorn |
| Frontend | React 18 · Vite · Tailwind CSS |
| State | Zustand |
| Animation | Framer Motion · Three.js · React Three Fiber v8 · @react-three/drei v9 |
| Icons | Lucide React |
| Routing | React Router v6 |
| Enrichment | Google Gemini 2.0 Flash (optional, offline script) |

> **React Three Fiber must stay at v8.** v9 requires React 19 and crashes on React 18 with a reconciler error.

---

## Quick start

### Backend
```bash
# From project root
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (configured in `vite.config.js`).

Open `http://localhost:5173`.

---

## Project structure

```
Rescratch/
├── app/
│   ├── main.py              # FastAPI routes
│   ├── scorer.py            # Completeness / coherence / rigor scoring
│   ├── evaluator.py         # Feedback generation + rubric checking
│   ├── compatibility.py     # Block connection validation rules
│   └── challenges.py        # JSON data loaders
├── data/
│   ├── challenges.json      # 159 challenges
│   ├── blocks.json          # 71 block definitions
│   └── feedback_templates.json
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── store.js          # Zustand global state
│       ├── api.js
│       ├── components/
│       │   ├── HeroPage.jsx
│       │   ├── ParticleHero.jsx   # Three.js particle system
│       │   ├── NavHeader.jsx
│       │   ├── ExplorePage.jsx
│       │   ├── FilterSidebar.jsx
│       │   ├── ChallengeRow.jsx
│       │   ├── LabRoute.jsx
│       │   ├── Layout.jsx
│       │   ├── LeftPanel.jsx
│       │   ├── ContextPanel.jsx   # Challenge brief + enriched context
│       │   ├── BlockLibrary.jsx
│       │   ├── FreeCanvas.jsx
│       │   ├── CanvasBlock.jsx
│       │   ├── ConnectionLine.jsx
│       │   ├── ScorePanel.jsx
│       │   ├── ResearchQuestion.jsx
│       │   └── Toolbar.jsx
│       ├── data/
│       │   ├── blockDefinitions.js
│       │   └── pillars.js
│       ├── hooks/
│       │   ├── useCanvas.js
│       │   └── useGameState.js
│       └── utils/
│           ├── connectionValidator.js
│           └── pipelineSerializer.js
├── scripts/
│   ├── enrich_with_gemini.py   # Offline enrichment via Gemini API
│   ├── fetch_arxiv.py          # Fetch arXiv papers as challenges
│   └── add_new_challenges.py   # Bulk-add hand-crafted challenges
└── tests/
    └── test_compatibility.py
```

---

## Routing

| URL | Page |
|---|---|
| `/` | Hero (particle animation + mission + features + pillar cards) |
| `/explore` | Challenge browser (filter by pillar, subtopic, difficulty, search) |
| `/lab/:challengeId` | Lab (canvas editor + scoring) |

URL params on `/explore`: `?pillar=technology&subtopic=machine_learning&difficulty=beginner&search=caffeine`

---

## Scoring

Every submission is scored out of **100 points** across three independent dimensions:

| Dimension | Max | How it's calculated |
|---|---|---|
| **Completeness** | 35 | 5 pts × 7 pipeline categories. Each category earns its 5 pts if at least one block is placed. |
| **Logical Coherence** | 35 | Starts at 35. Deducts 10 pts per critical error, 5 pts per warning (type mismatches, missing IV/DV, wrong method for data type). |
| **Methodological Rigor** | 30 | Bonus points: +6 for control variable, +6 for adequate sample, +6 for rigorous sampling, +6 for confounding variable, +6 for complex analysis (regression or ANOVA). |

---

## Pipeline block categories

Blocks must be connected in this order:

```
HYPOTHESIS → VARIABLE → METHOD → SAMPLE → DATA_COLLECTION → ANALYSIS → CONCLUSION
```

`VARIABLE→VARIABLE` and `SAMPLE→SAMPLE` chains are also valid (for multiple variables or sampling strategies).

### Block inventory (71 blocks)

| Category | Count | Examples |
|---|---|---|
| HYPOTHESIS | 3 | Directional, Nondirectional, Null |
| VARIABLE | 4 | Independent, Dependent, Control, Confounding |
| METHOD | 19 | Lab Experiment, Field Experiment, Survey, RCT, Ablation, Wet Lab, In Vitro, In Vivo, Longitudinal, Formal Proof, Numerical Simulation… |
| SAMPLE | 7 | Small/Medium/Large, Random, Stratified, Convenience, Snowball |
| DATA_COLLECTION | 19 | Measurement, Count, Likert, Observation, Spectroscopy, Microscopy, Sequencing, Loss Curves, Confusion Matrix, Sensor… |
| ANALYSIS | 15 | T-test, ANOVA, Regression, Chi-square, Correlation, Thematic, Survival, Monte Carlo, Convergence… |
| CONCLUSION | 4 | Supports, Rejects, Inconclusive, Further Research |

---

## Challenges

**159 total** across 5 disciplines:

| Discipline | Count | Levels |
|---|---|---|
| Technology (ML, CV, NLP, RL, Cybersecurity) | 78 | beginner → expert |
| Mathematics (Pure, Applied, Statistics) | 30 | intermediate → expert |
| Engineering (Electrical/CS, Mechanical/Aerospace) | 18 | intermediate → expert |
| Science (Biology, Chemistry, Physics) | 17 | beginner → advanced |
| Human & Social (Psychology, Economics, Sociology) | 16 | beginner → advanced |

**Difficulty breakdown:** 18 beginner · 25 intermediate · 34 advanced · 82 expert

**Challenge types:**
- **Normal** (155): Build a valid pipeline from scratch
- **Broken Lab** (4): A pre-wired pipeline with deliberate methodological errors — find and fix every mistake

---

## Challenge schema

```jsonc
{
  "id": "unique_snake_case_id",
  "title": "Research question?",
  "difficulty": "beginner | intermediate | advanced | expert",
  "level": 1,                    // controls sort order in explore page
  "description": "One-paragraph scenario.",
  "brief": {                     // rich structured brief (shown in lab)
    "background": "...",
    "scenario": "...",
    "task": "...",
    "constraints": ["...", "..."],
    "input_format": "...",
    "expected_output": "..."
  },
  "available_categories": [      // restrict which block types appear in library
    "HYPOTHESIS", "VARIABLE", "METHOD", "SAMPLE",
    "DATA_COLLECTION", "ANALYSIS", "CONCLUSION"
  ],
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "tags": ["experiment", "quantitative", "deep-learning"],
  "pillar": "technology",
  "subtopic": "machine_learning",
  "arxiv_id": "2510.05528",      // optional — renders "View paper on arXiv" link

  // Broken lab only:
  "type": "broken_lab",
  "broken_canvas": {
    "blocks": [
      { "instanceId": "b1", "blockDefId": "method_survey", "x": 460, "y": 100 }
    ],
    "connections": [
      { "id": "c1", "fromInstanceId": "b1", "toInstanceId": "b2" }
    ]
  },

  // Added by enrich_with_gemini.py (optional):
  "background": {
    "objective": "...",
    "context": "...",
    "task": "...",
    "constraints": ["..."],
    "key_terms": [{ "term": "...", "definition": "..." }]
  },
  "ideal_pipeline": { ... },
  "common_mistakes": [ ... ],
  "grading_rubric": {
    "must_have": ["..."],
    "bonus": ["..."],
    "penalties": ["..."]
  }
}
```

---

## API

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/challenges` | All challenges (summary fields only) |
| `GET` | `/api/challenges/{id}` | Full challenge object |
| `GET` | `/api/blocks` | All 71 block definitions |
| `POST` | `/api/evaluate` | Score a submitted pipeline |

### POST /api/evaluate

**Request:**
```json
{
  "challenge_id": "data_augmentation_accuracy",
  "pipeline": {
    "HYPOTHESIS": ["hypothesis_directional"],
    "VARIABLE": ["independent_variable", "dependent_variable", "control_variable"],
    "METHOD": ["method_experiment_lab"],
    "SAMPLE": ["sample_medium", "sampling_random"],
    "DATA_COLLECTION": ["data_measurement"],
    "ANALYSIS": ["analysis_t_test"],
    "CONCLUSION": ["conclusion_supports"]
  }
}
```

**Response:**
```json
{
  "score": 91,
  "breakdown": {
    "completeness": 35,
    "logical_coherence": 35,
    "methodological_rigor": 21
  },
  "feedback": {
    "summary": "Strong methodology with good controls.",
    "errors": [],
    "warnings": [],
    "suggestions": ["Consider ANOVA if extending to multiple conditions."],
    "encouragement": "..."
  },
  "rubric_results": {
    "met": ["Must use a control variable", "Must use quantitative data collection"],
    "missed": [],
    "bonuses": ["Uses random sampling"],
    "penalties": []
  },
  "ideal_comparison": {
    "method_match": true,
    "analysis_match": true,
    "variables_match": true,
    "explanation": "..."
  },
  "common_mistakes_triggered": [],
  "is_valid": true
}
```

`rubric_results`, `ideal_comparison`, and `common_mistakes_triggered` are `null`/empty for challenges that have not been enriched with Gemini.

---

## Gemini enrichment (optional)

Running the enrichment script adds four AI-generated fields to every challenge in `data/challenges.json`: a structured background with key terms, an ideal pipeline specification, a list of common student mistakes, and a grading rubric. The backend's scoring engine uses these fields automatically when they exist.

```powershell
# PowerShell
$env:GEMINI_API_KEY="your_key_here"
python scripts/enrich_with_gemini.py

# Options
python scripts/enrich_with_gemini.py --ids data_augmentation_accuracy learning_rate_convergence
python scripts/enrich_with_gemini.py --force          # re-enrich already-enriched challenges
python scripts/enrich_with_gemini.py --dry-run        # preview prompts without API calls
```

Model: `gemini-2.0-flash`. Get a free key at [aistudio.google.com](https://aistudio.google.com).

---

## Adding challenges

### Option 1: Edit `data/challenges.json` directly

Add a JSON object following the schema above. The backend reloads on restart (or immediately with `--reload`). No code changes needed.

### Option 2: Fetch from arXiv

```bash
python scripts/fetch_arxiv.py --query "fine-tuning LLM" --max 5 --out data/challenges.json
```

### Option 3: Write a script

See `scripts/add_new_challenges.py` for an example of bulk-adding hand-crafted challenges with full `brief` content.

---

## Adding blocks

Edit `data/blocks.json`. Each block definition:

```json
{
  "id": "method_experiment_lab",
  "category": "METHOD",
  "label": "Lab Experiment",
  "description": "Controlled experiment in a laboratory setting with direct manipulation of the IV.",
  "tags": ["quantitative", "experimental"],
  "data_type": "quantitative",
  "required_data_type": "quantitative"
}
```

`data_type` and `required_data_type` are used by the compatibility engine to detect method/data and analysis/data mismatches.

---

## Connection validation rules

Defined in `app/compatibility.py`. Key rules:

| Rule | Severity | Description |
|---|---|---|
| `analysis_data_compatible` | error | Analysis block's `required_data_type` must match data collection block's `data_type` |
| `method_data_compatible` | error | Method block's `data_type` must match data collection block's `data_type` |
| `method_requires_control` | error | Experimental methods (lab, field, RCT) require a control_variable block |
| `hypothesis_has_iv_dv` | error | At least one hypothesis block requires IV and DV blocks |
| `adequate_sample_size` | warning | Small sample with experimental method triggers warning |
| `sampling_quality` | warning | Convenience sampling with experimental method triggers warning |
| `has_confounding_variable` | info | Suggests adding a confounding variable for rigor |

---

## Running tests

```bash
# Backend unit tests
pytest tests/

# Manual scorer test
python scripts/test_scorer.py
```

---

## Design constraints

- **No AI at runtime.** `app/evaluator.py` generates all feedback from templates and rule matching only. No external API calls during gameplay.
- **No database.** All data lives in `data/*.json`. The backend loads everything into memory at startup.
- **No authentication.** Single-player, stateless. Progress is not persisted between sessions.
- **React Three Fiber v8 only.** v9 requires React 19. Locked in `package.json`.
