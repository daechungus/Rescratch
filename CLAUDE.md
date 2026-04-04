# ReScratch — Scratch for Research

## Project Overview
ReScratch is a drag-and-drop research methodology game. Players are given a research question and must build a valid scientific methodology by dragging blocks into a 7-zone pipeline. A rule-based engine scores and evaluates the pipeline.

## Stack
- **Backend**: Python 3.11, FastAPI, uvicorn
- **Frontend**: React + Vite + Tailwind CSS + @dnd-kit/core + @dnd-kit/sortable + zustand + framer-motion
- **Data**: JSON files in `data/` directory

## CRITICAL CONSTRAINT
**No AI/LLM APIs. No database. No external APIs.**
All evaluation is 100% rule-based using the JSON data files in `data/`.

## Commands

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

### Tests
```bash
# From project root
pytest tests/
python scripts/test_scorer.py
```

## Architecture

```
Rescratch/
├── app/
│   ├── main.py          # FastAPI routes
│   ├── compatibility.py # Rule-based validation logic
│   ├── scorer.py        # Scoring algorithm
│   ├── evaluator.py     # Feedback generation
│   └── challenges.py    # JSON data loaders
├── data/
│   ├── blocks.json           # All block definitions
│   ├── challenges.json       # All 8 challenges
│   └── feedback_templates.json
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       ├── utils/        # Utilities
│       ├── store.js      # Zustand state management
│       ├── api.js        # API client
│       └── App.jsx
├── scripts/
│   └── test_scorer.py
└── tests/
    └── test_compatibility.py
```

## Game Flow
1. Player selects a challenge (research question) from LevelSelect
2. Player drags blocks from the left palette into 7 pipeline zones
3. Player clicks Submit → backend evaluates and returns score + feedback
4. Score panel shows on the right with detailed breakdown

## Pipeline Zones (in order)
1. HYPOTHESIS
2. VARIABLE (multiple allowed)
3. METHOD
4. SAMPLE (multiple allowed)
5. DATA_COLLECTION
6. ANALYSIS
7. CONCLUSION
