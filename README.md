Customizing my own challenges. 


{
  "id": "my_unique_id",
  "title": "Your research question here?",
  "difficulty": "beginner",
  "level": 9,
  "description": "More context about the study scenario.",
  "available_categories": ["HYPOTHESIS", "VARIABLE", "METHOD", "SAMPLE", "DATA_COLLECTION", "ANALYSIS", "CONCLUSION"],
  "hints": [
    "First hint shown when player clicks Hint",
    "Second hint (shown on next click)",
    "Third hint"
  ],
  "tags": ["experiment", "quantitative", "deep-learning"]
}
difficulty — "beginner", "intermediate", "advanced", or "expert"

available_categories — you can restrict early levels by removing categories, e.g. a level 1 could only show ["HYPOTHESIS", "VARIABLE", "METHOD"] to keep it simple.

tags — purely cosmetic, shown as badges on the level card. Use whatever labels you want.

The backend rule engine doesn't care about the challenge content — it only evaluates the blocks the player places. So you can add as many challenges as you want without touching any code.



