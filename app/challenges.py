import json
from pathlib import Path


def load_challenges(data_dir: Path) -> dict:
    """Returns {id: challenge_dict} mapping"""
    path = data_dir / "challenges.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {c["id"]: c for c in data["challenges"]}


def load_blocks(data_dir: Path) -> dict:
    """Returns {id: block_dict} mapping"""
    path = data_dir / "blocks.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["id"]: b for b in data["blocks"]}


def load_templates(data_dir: Path) -> dict:
    """Returns the feedback templates dict"""
    path = data_dir / "feedback_templates.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
