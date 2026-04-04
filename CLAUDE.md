# ReScratch — Scratch for Research

## One-liner
Visual node-editor game where players build research methodologies by snapping blocks together on a free canvas. A rule-based engine scores the pipeline. No AI/LLM/database — 100% deterministic.

## Commands
```bash
# Backend (from project root)
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Tests
pytest tests/
python scripts/test_scorer.py

# Add arxiv papers as challenges
python scripts/fetch_arxiv.py --query "fine-tuning LLM" --max 5 --out data/challenges.json
```

## Stack
- **Backend**: Python 3.11, FastAPI — `app/`
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, Framer Motion — `frontend/src/`
- **No DB, no LLM APIs.** All data lives in `data/*.json`.

## Critical constraint
`app/evaluator.py` generates feedback from templates + rule engine only. Never import anthropic or call any external API.

## File map

### Backend
| File | Purpose |
|---|---|
| `app/main.py` | FastAPI routes: GET /api/challenges, GET /api/blocks, POST /api/evaluate |
| `app/compatibility.py` | Block connection rules (analysis/data compat, method/data compat, etc.) |
| `app/scorer.py` | Scores pipeline: completeness (0-30) + coherence (0-30) + rigor (0-25) = 85 max |
| `app/evaluator.py` | Builds feedback dict from validation results + templates |
| `app/challenges.py` | Loads data/*.json files |

### Data (edit these to customize content)
| File | Purpose |
|---|---|
| `data/challenges.json` | All 10 challenges. Add/edit freely — backend reloads on restart |
| `data/blocks.json` | Block definitions (id, category, label, description, tags, data_type, etc.) |
| `data/feedback_templates.json` | Template strings for error/warning/suggestion messages |

### Frontend key files
| File | Purpose |
|---|---|
| `src/store.js` | Zustand store — canvasBlocks, connections, connectingFrom, liveValidation, gamePhase |
| `src/components/FreeCanvas.jsx` | Dot-grid canvas; renders CanvasBlock + ConnectionLine + LiveConnectionLine |
| `src/components/BlockLibrary.jsx` | Dark sidebar; click block → addBlockToCanvas() |
| `src/components/CanvasBlock.jsx` | Draggable block with input/output ports; shake animation on invalid connect |
| `src/components/ConnectionLine.jsx` | SVG bezier between two blocks; × delete button at midpoint |
| `src/components/LiveConnectionLine.jsx` | Dashed bezier that follows cursor while connecting |
| `src/hooks/useCanvas.js` | Pointer drag logic, port click handlers (startConnection/finishConnection) |
| `src/utils/connectionValidator.js` | validatePortConnection() + validatePipelineClient() for live badges |
| `src/utils/pipelineSerializer.js` | canvasBlocks[] → { CATEGORY: [blockDefId,...] } for API |
| `src/data/blockDefinitions.js` | CATEGORY_COLORS, VALID_CONNECTIONS, PORT_COLORS, PIPELINE_ORDER |

## Game flow
1. `LevelSelect` → player picks a challenge
2. `BlockLibrary` (left) → click a block → it spawns on the `FreeCanvas`
3. Drag blocks to reposition. Click output port (right dot) → click input port (left dot) to connect
4. Invalid connection → shake animation + red flash on target block
5. Live validation badges update on every canvas change
6. "▶ Run Experiment" → POST /api/evaluate → ScorePanel slides in on the right
7. Broken Lab challenges pre-fill the canvas with a flawed pipeline to debug

## Challenge schema (data/challenges.json)
```json
{
  "id": "unique_id",
  "type": "broken_lab",          // omit for normal challenge
  "title": "Research question?",
  "difficulty": "beginner|intermediate|advanced|expert",
  "level": 1,
  "description": "Scenario text shown to player.",
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": ["Hint shown on click 1", "Hint 2"],
  "tags": ["experiment", "quantitative", "deep-learning"],
  "broken_canvas": {             // only for broken_lab type
    "blocks": [{ "instanceId": "b1", "blockDefId": "hypothesis_directional", "x": 60, "y": 80 }],
    "connections": [{ "id": "c1", "fromInstanceId": "b1", "toInstanceId": "b2" }]
  }
}
```

## Valid connection order
HYPOTHESIS → VARIABLE → METHOD → SAMPLE → DATA_COLLECTION → ANALYSIS → CONCLUSION

VARIABLE→VARIABLE and SAMPLE→SAMPLE chains are also allowed.
